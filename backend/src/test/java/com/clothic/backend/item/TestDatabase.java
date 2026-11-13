package com.clothic.backend.item;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.springframework.jdbc.core.JdbcTemplate;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;

/**
 * 테스트 전용 임베디드 PostgreSQL 17. 운영 데이터베이스에는 절대 연결하지 않는다.
 *
 * <p>같은 테스트를 두 스키마에서 실행한다. 시스템 속성 {@code clothic.test.schema}로 고른다.
 * <ul>
 *   <li>{@code supabase}(기본): 저장소의 Supabase migration SQL을 그대로 적용해 전환 전 스키마와 RLS 정책을 만든다.</li>
 *   <li>{@code owned}: 서버가 소유하는 Flyway 이력({@code db/migration})을 빈 DB에 적용한다. auth 스키마와 RLS가 없다.</li>
 * </ul>
 */
public final class TestDatabase {

    public static final String BACKEND_ROLE = "clothic_backend";
    public static final String BACKEND_PASSWORD = "clothic_backend_test";
    static final String PROBE_ROLE = "clothic_rls_probe";
    static final String PROBE_PASSWORD = "clothic_rls_probe_test";

    private static final boolean OWNED_SCHEMA = "owned".equals(System.getProperty("clothic.test.schema", "supabase"));
    private static final Path MIGRATIONS = Path.of("..", "supabase", "migrations");
    private static final Path TEST_SQL = Path.of("src", "test", "resources", "db");

    private static EmbeddedPostgres postgres;

    private TestDatabase() {
    }

    /** 서버 소유 스키마로 실행 중이면 true. Supabase 전용 동작(RLS)을 확인하는 테스트는 이때 건너뛴다. */
    public static boolean ownedSchema() {
        return OWNED_SCHEMA;
    }

    /** 계정 행이 있는 테이블. 전환 전에는 Supabase의 auth.users, 자체 스키마에서는 public.users다. */
    public static String usersTable() {
        return OWNED_SCHEMA ? "public.users" : "auth.users";
    }

    /** 계정 행을 만든다. 두 스키마 모두 삽입 시 프로필 행이 함께 생긴다. 이미 있으면 그대로 둔다. */
    public static void insertUsers(UUID... ids) {
        JdbcTemplate admin = new JdbcTemplate(superuser());
        for (UUID id : ids) {
            admin.update("insert into " + usersTable() + " (id) values (?) on conflict (id) do nothing", id);
        }
    }

    /** 계정 행을 지운다. 외래 키의 on delete cascade로 그 사용자의 프로필·아이템·코디도 함께 지워진다. */
    public static void deleteUsers(UUID... ids) {
        JdbcTemplate admin = new JdbcTemplate(superuser());
        for (UUID id : ids) {
            admin.update("delete from " + usersTable() + " where id = ?", id);
        }
    }

    public static void deleteAllUsers() {
        new JdbcTemplate(superuser()).update("delete from " + usersTable());
    }

    static synchronized EmbeddedPostgres start() {
        if (postgres == null) {
            try {
                postgres = EmbeddedPostgres.builder().start();
                DataSource admin = postgres.getPostgresDatabase();
                if (OWNED_SCHEMA) {
                    apply(admin, TEST_SQL.resolve("owned").resolve("00-roles.sql"));
                    Flyway.configure().dataSource(admin).locations("classpath:db/migration").load().migrate();
                    apply(admin, TEST_SQL.resolve("owned").resolve("99-grants.sql"));
                } else {
                    apply(admin, TEST_SQL.resolve("00-auth-stub.sql"));
                    for (Path migration : sortedSqlFiles(MIGRATIONS)) {
                        apply(admin, migration);
                    }
                    apply(admin, TEST_SQL.resolve("99-grants.sql"));
                }
                Runtime.getRuntime().addShutdownHook(new Thread(TestDatabase::stop));
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
        }
        return postgres;
    }

    public static String jdbcUrl(String role, String password) {
        return start().getJdbcUrl(role, "postgres") + "&password=" + password;
    }

    public static DataSource superuser() {
        return start().getPostgresDatabase();
    }

    static List<Path> sortedSqlFiles(Path directory) throws IOException {
        try (Stream<Path> files = Files.list(directory)) {
            return files.filter(path -> path.toString().endsWith(".sql")).sorted().toList();
        }
    }

    private static void apply(DataSource dataSource, Path sqlFile) throws IOException {
        String sql = Files.readString(sqlFile);
        try (Connection connection = dataSource.getConnection(); Statement statement = connection.createStatement()) {
            statement.execute(sql);
        } catch (SQLException e) {
            throw new IllegalStateException("failed to apply " + sqlFile + ": " + e.getMessage(), e);
        }
    }

    private static synchronized void stop() {
        if (postgres != null) {
            try {
                postgres.close();
            } catch (IOException ignored) {
                // 종료 중 오류는 테스트 결과에 영향을 주지 않는다.
            }
            postgres = null;
        }
    }
}
