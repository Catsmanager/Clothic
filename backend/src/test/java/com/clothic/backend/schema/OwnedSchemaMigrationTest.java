package com.clothic.backend.schema;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;

/**
 * 완전히 빈 PostgreSQL에 서버를 기동해, CLOTHIC_DB_MIGRATE를 켠 운영 경로와 같은 방식으로 Flyway가 스키마를 만드는지 확인한다.
 * 다른 테스트의 DB와 섞이지 않도록 이 클래스만의 임베디드 PostgreSQL을 쓴다.
 */
@SpringBootTest(properties = {
        "spring.flyway.enabled=true",
        // Flyway가 만든 스키마와 엔티티 매핑이 일치하지 않으면 기동이 실패한다.
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.datasource.hikari.initialization-fail-timeout=1",
})
class OwnedSchemaMigrationTest {

    private static EmbeddedPostgres emptyDatabase;

    @DynamicPropertySource
    static void emptyDatabaseConnection(DynamicPropertyRegistry registry) throws IOException {
        emptyDatabase = EmbeddedPostgres.builder().start();
        registry.add("spring.datasource.url", () -> emptyDatabase.getJdbcUrl("postgres", "postgres"));
        registry.add("spring.datasource.username", () -> "postgres");
        registry.add("spring.datasource.password", () -> "");
    }

    @AfterAll
    static void stopDatabase() throws IOException {
        if (emptyDatabase != null) {
            emptyDatabase.close();
        }
    }

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private Flyway flyway;

    @Test
    void startupAppliesEveryMigrationOnceAndRerunChangesNothing() {
        Integer failed = jdbc.queryForObject(
                "select count(*) from flyway_schema_history where not success", Integer.class);
        List<String> applied = jdbc.queryForList(
                "select version from flyway_schema_history where success order by installed_rank", String.class);

        assertEquals(0, failed);
        assertEquals("1", applied.get(0));
        assertEquals(0, flyway.migrate().migrationsExecuted, "이미 적용한 이력은 다시 실행하지 않는다");
    }

    @Test
    void createsTheFiveAppTablesWithoutSupabaseObjects() {
        List<String> tables = jdbc.queryForList("""
                select tablename from pg_tables
                where schemaname = 'public' and tablename <> 'flyway_schema_history' order by tablename
                """, String.class);
        Integer authSchemas = jdbc.queryForObject(
                "select count(*) from pg_namespace where nspname = 'auth'", Integer.class);
        Integer rlsTables = jdbc.queryForObject("""
                select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
                where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
                """, Integer.class);

        assertEquals(List.of("items", "notifications", "outfits", "profiles", "users"), tables);
        assertEquals(0, authSchemas, "Supabase의 auth 스키마에 의존하지 않는다");
        assertEquals(0, rlsTables, "RLS 정책 없이 서버의 user_id 조건으로 격리한다");
    }

    @Test
    void newUserGetsAProfileAndDeletingTheUserRemovesOnlyTheirRows() {
        UUID leaving = UUID.randomUUID();
        UUID staying = UUID.randomUUID();
        jdbc.update("insert into users (id) values (?), (?)", leaving, staying);
        for (UUID user : List.of(leaving, staying)) {
            jdbc.update("insert into items (user_id, name, category, color) values (?, '셔츠', 'top', '#FFFFFF')", user);
            jdbc.update("insert into outfits (user_id, date) values (?, date '2026-11-13')", user);
            jdbc.update("insert into notifications (user_id, type, icon, title, body) values (?, 't', 'i', '제목', '본문')",
                    user);
        }
        assertEquals(1, rows("profiles", "id", leaving), "계정이 생기면 프로필 행이 함께 생긴다");

        jdbc.update("delete from users where id = ?", leaving);

        assertEquals(0, rows("profiles", "id", leaving));
        for (String table : List.of("items", "outfits", "notifications")) {
            assertEquals(0, rows(table, "user_id", leaving), table);
            assertEquals(1, rows(table, "user_id", staying), table);
        }
        assertEquals(1, rows("profiles", "id", staying));
    }

    @Test
    void sameUserCannotOwnTheSameCatalogItemTwice() {
        UUID user = UUID.randomUUID();
        jdbc.update("insert into users (id) values (?)", user);
        String insert = """
                insert into items (user_id, catalog_item_id, name, category, color)
                values (?, 'top_001_white', '흰 셔츠', 'top', '#FFFFFF') on conflict do nothing
                """;

        assertEquals(1, jdbc.update(insert, user));
        assertEquals(0, jdbc.update(insert, user));
        assertTrue(rows("items", "user_id", user) == 1);
    }

    private int rows(String table, String column, UUID id) {
        Integer count = jdbc.queryForObject(
                "select count(*) from " + table + " where " + column + " = ?", Integer.class, id);
        return count == null ? -1 : count;
    }
}
