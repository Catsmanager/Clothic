package com.clothic.backend.item;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * 격리된 PostgreSQL 17에 저장소 migration을 적용한 뒤, 백엔드 역할로 본인 아이템만 조회되는지와 매핑·RLS 동작을 확인한다.
 */
@SpringBootTest(properties = {
        // DB가 있는 테스트에서는 엔티티 매핑이 실제 스키마와 일치하는지 검증한다.
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.datasource.hikari.initialization-fail-timeout=1",
})
class ItemQueryServiceTest {

    private static final UUID USER_A = UUID.fromString("11111111-1111-4111-8111-111111111111");
    private static final UUID USER_B = UUID.fromString("22222222-2222-4222-8222-222222222222");
    private static final UUID USER_C_NO_ROWS = UUID.fromString("33333333-3333-4333-8333-333333333333");
    private static final UUID A_OLDER = UUID.fromString("aaaaaaaa-0000-4000-8000-000000000001");
    private static final UUID A_NEWER = UUID.fromString("aaaaaaaa-0000-4000-8000-000000000002");
    private static final UUID B_ONLY = UUID.fromString("bbbbbbbb-0000-4000-8000-000000000001");
    private static final OffsetDateTime OLDER_AT = OffsetDateTime.parse("2026-06-01T09:00:00+09:00");
    private static final OffsetDateTime NEWER_AT = OffsetDateTime.parse("2026-06-02T09:00:00+09:00");

    @DynamicPropertySource
    static void backendConnection(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> TestDatabase.jdbcUrl(TestDatabase.BACKEND_ROLE, TestDatabase.BACKEND_PASSWORD));
        registry.add("spring.datasource.username", () -> TestDatabase.BACKEND_ROLE);
        registry.add("spring.datasource.password", () -> TestDatabase.BACKEND_PASSWORD);
    }

    @BeforeAll
    static void seed() {
        JdbcTemplate admin = new JdbcTemplate(TestDatabase.superuser());
        admin.update("delete from public.items");
        admin.update("delete from auth.users");
        admin.update("insert into auth.users (id, email) values (?, ?), (?, ?)",
                USER_A, "a@test.local", USER_B, "b@test.local");
        admin.update("""
                insert into public.items (id, user_id, catalog_item_id, name, category, image_path, color, style_tags, created_at)
                values (?, ?, ?, ?, ?, ?, ?, ?::text[], ?)
                """, A_OLDER, USER_A, null, "검정 티셔츠", "top", "", "#000000", "{casual,basic}", OLDER_AT);
        admin.update("""
                insert into public.items (id, user_id, catalog_item_id, name, category, image_path, color, style_tags, created_at)
                values (?, ?, ?, ?, ?, ?, ?, ?::text[], ?)
                """, A_NEWER, USER_A, "top_001_white", "흰 셔츠", "top", "", "#FFFFFF", "{}", NEWER_AT);
        admin.update("""
                insert into public.items (id, user_id, catalog_item_id, name, category, image_path, color, style_tags, created_at)
                values (?, ?, ?, ?, ?, ?, ?, ?::text[], ?)
                """, B_ONLY, USER_B, null, "청바지", "bottom", "", "#1E3A8A", "{denim}", NEWER_AT);
    }

    @Autowired
    private ItemQueryService service;

    @Test
    void returnsOnlyTheAuthenticatedUsersItemsNewestFirst() {
        List<Item> items = service.findOwnedItems(USER_A);

        assertEquals(List.of(A_NEWER, A_OLDER), items.stream().map(Item::getId).toList());
        assertTrue(items.stream().allMatch(item -> USER_A.equals(item.getUserId())));
    }

    @Test
    void mapsCatalogIdArrayAndTimestampFromRealPostgres() {
        List<Item> items = service.findOwnedItems(USER_A);
        Item newer = items.get(0);
        Item older = items.get(1);

        assertEquals("top_001_white", newer.getCatalogItemId());
        assertArrayEquals(new String[0], newer.getStyleTags());
        assertNull(older.getCatalogItemId());
        assertArrayEquals(new String[] {"casual", "basic"}, older.getStyleTags());
        assertEquals("top", older.getCategory());
        assertEquals("#000000", older.getColor());
        assertEquals("", older.getImagePath());
        assertEquals(Instant.parse("2026-06-01T00:00:00Z"), older.getCreatedAt().toInstant());
        assertEquals(Instant.parse("2026-06-02T00:00:00Z"), newer.getCreatedAt().toInstant());
    }

    @Test
    void otherUserSeesOnlyTheirOwnRowAndUnknownUserSeesNothing() {
        List<Item> itemsOfB = service.findOwnedItems(USER_B);
        assertEquals(List.of(B_ONLY), itemsOfB.stream().map(Item::getId).toList());

        assertTrue(service.findOwnedItems(USER_C_NO_ROWS).isEmpty());
    }

    @Test
    void rejectsMissingUserIdBeforeQuerying() {
        assertThrows(NullPointerException.class, () -> service.findOwnedItems(null));
    }

    @Test
    void rowLevelSecurityBlocksPlainConnectionsWithoutJwtContextForNonBypassRoles() throws Exception {
        String url = TestDatabase.jdbcUrl(TestDatabase.PROBE_ROLE, TestDatabase.PROBE_PASSWORD);
        try (Connection probe = DriverManager.getConnection(url)) {
            assertEquals(0, countItems(probe), "auth.uid()가 없는 일반 연결은 RLS 정책으로 0행이어야 한다");

            try (Statement statement = probe.createStatement()) {
                statement.execute("select set_config('request.jwt.claim.sub', '" + USER_A + "', false)");
            }
            assertEquals(2, countItems(probe), "JWT sub를 설정하면 그 사용자 행만 보인다");
        }
    }

    private static int countItems(Connection connection) throws Exception {
        try (PreparedStatement statement = connection.prepareStatement("select count(*) from public.items");
                ResultSet rs = statement.executeQuery()) {
            rs.next();
            return rs.getInt(1);
        }
    }
}
