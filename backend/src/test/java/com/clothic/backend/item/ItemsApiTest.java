package com.clothic.backend.item;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import com.clothic.backend.auth.TestTokens;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.crypto.MACSigner;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * 실제 HTTP + HS256 테스트 토큰 + 격리된 PostgreSQL로 GET /api/items 응답 계약을 확인한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "clothic.auth.issuer=" + TestTokens.ISSUER,
        "clothic.auth.hmac-secret=" + ItemsApiTest.SECRET,
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.datasource.hikari.initialization-fail-timeout=1",
})
class ItemsApiTest {

    static final String SECRET = "items-api-test-only-secret-with-at-least-32-bytes-0123456789";

    private static final UUID USER_A = UUID.fromString("41111111-1111-4111-8111-111111111111");
    private static final UUID USER_B = UUID.fromString("42222222-2222-4222-8222-222222222222");
    private static final UUID USER_EMPTY = UUID.fromString("43333333-3333-4333-8333-333333333333");
    private static final UUID A_OLD = UUID.fromString("4aaaaaaa-0000-4000-8000-000000000001");
    private static final UUID A_NEW = UUID.fromString("4aaaaaaa-0000-4000-8000-000000000002");
    private static final UUID A_BAD_CATEGORY = UUID.fromString("4aaaaaaa-0000-4000-8000-000000000003");
    private static final UUID B_ONLY = UUID.fromString("4bbbbbbb-0000-4000-8000-000000000001");
    private static final OffsetDateTime OLD_AT = OffsetDateTime.parse("2026-07-01T09:00:00+09:00");
    private static final OffsetDateTime NEW_AT = OffsetDateTime.parse("2026-07-02T09:00:00+09:00");

    private static final ObjectMapper JSON = new ObjectMapper();

    @DynamicPropertySource
    static void backendConnection(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> TestDatabase.jdbcUrl(TestDatabase.BACKEND_ROLE, TestDatabase.BACKEND_PASSWORD));
        registry.add("spring.datasource.username", () -> TestDatabase.BACKEND_ROLE);
        registry.add("spring.datasource.password", () -> TestDatabase.BACKEND_PASSWORD);
    }

    @BeforeAll
    static void seed() {
        JdbcTemplate admin = new JdbcTemplate(TestDatabase.superuser());
        admin.update("delete from public.items where user_id in (?, ?, ?)", USER_A, USER_B, USER_EMPTY);
        TestDatabase.deleteUsers(USER_A, USER_B, USER_EMPTY);
        TestDatabase.insertUsers(USER_A, USER_B, USER_EMPTY);
        String insert = """
                insert into public.items (id, user_id, catalog_item_id, name, category, image_path, color, style_tags, created_at)
                values (?, ?, ?, ?, ?, ?, ?, ?::text[], ?)
                """;
        admin.update(insert, A_OLD, USER_A, null, "검정 티셔츠", "top", "", "#000000", "{casual,not-a-tag,basic}", OLD_AT);
        admin.update(insert, A_NEW, USER_A, "shoes_002_white", "흰 운동화", "shoes", "", "#FFFFFF", "{sporty}", NEW_AT);
        admin.update(insert, A_BAD_CATEGORY, USER_A, null, "모자", "hat", "", "#333333", "{casual}", NEW_AT);
        admin.update(insert, B_ONLY, USER_B, null, "청바지", "bottom", "", "#1E3A8A", "{street}", NEW_AT);
    }

    @LocalServerPort
    private int port;

    private static String tokenFor(UUID userId) throws Exception {
        return TestTokens.sign(new MACSigner(SECRET), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().subject(userId.toString()).build());
    }

    @Test
    void returnsOwnItemsNewestFirstInUserItemShape() throws Exception {
        HttpResponse<String> response = TestTokens.get(port, "/api/items", tokenFor(USER_A));

        assertEquals(200, response.statusCode());
        assertTrue(response.headers().firstValue("content-type").orElse("").startsWith("application/json"));
        JsonNode items = JSON.readTree(response.body());
        assertEquals(2, items.size(), "허용하지 않은 카테고리(hat) 행은 제외된다");

        JsonNode newest = items.get(0);
        assertEquals(A_NEW.toString(), newest.get("id").asString());
        assertEquals(USER_A.toString(), newest.get("userId").asString());
        assertEquals("shoes_002_white", newest.get("catalogItemId").asString());
        assertEquals("흰 운동화", newest.get("name").asString());
        assertEquals("shoes", newest.get("category").asString());
        assertEquals("", newest.get("imagePath").asString());
        assertEquals("#FFFFFF", newest.get("color").asString());
        assertEquals(List.of("sporty"), JSON.convertValue(newest.get("styleTags"), List.class));
        assertEquals(Instant.parse("2026-07-02T00:00:00Z"), Instant.parse(newest.get("createdAt").asString()));

        JsonNode oldest = items.get(1);
        assertEquals(A_OLD.toString(), oldest.get("id").asString());
        assertTrue(oldest.get("catalogItemId").isNull());
        assertEquals(List.of("casual"), JSON.convertValue(oldest.get("styleTags"), List.class),
                "허용하지 않은 스타일 태그는 제거된다");
        assertEquals(Instant.parse("2026-07-01T00:00:00Z"), Instant.parse(oldest.get("createdAt").asString()));

        @SuppressWarnings("unchecked")
        Map<String, Object> fields = JSON.convertValue(newest, java.util.LinkedHashMap.class);
        assertEquals(List.of("id", "userId", "catalogItemId", "name", "category", "imagePath", "color", "styleTags", "createdAt"),
                List.copyOf(fields.keySet()), "필드 이름과 순서가 앱 UserItem과 같다");
    }

    @Test
    void otherUserOnlySeesTheirOwnRows() throws Exception {
        JsonNode items = JSON.readTree(TestTokens.get(port, "/api/items", tokenFor(USER_B)).body());

        assertEquals(1, items.size());
        assertEquals(B_ONLY.toString(), items.get(0).get("id").asString());
    }

    @Test
    void userWithoutItemsGetsEmptyArray() throws Exception {
        HttpResponse<String> response = TestTokens.get(port, "/api/items", tokenFor(USER_EMPTY));

        assertEquals(200, response.statusCode());
        assertEquals("[]", response.body());
    }

    @Test
    void missingOrInvalidTokenIsRejectedBeforeAnyData() throws Exception {
        HttpResponse<String> missing = TestTokens.get(port, "/api/items", null);
        assertEquals(401, missing.statusCode());
        assertFalse(missing.body().contains(A_NEW.toString()));

        String forged = TestTokens.sign(new MACSigner("wrong-secret-for-items-api-at-least-32-bytes-long-xx"),
                JWSAlgorithm.HS256, null, TestTokens.supabaseClaims().subject(USER_A.toString()).build());
        assertEquals(401, TestTokens.get(port, "/api/items", forged).statusCode());
    }

    @Test
    void userIdQueryParameterIsRejectedAndDoesNotChangeTarget() throws Exception {
        for (String param : List.of("userId", "user_id")) {
            HttpResponse<String> response = TestTokens.get(port, "/api/items?" + param + "=" + USER_B, tokenFor(USER_A));

            assertEquals(400, response.statusCode(), param);
            assertFalse(response.body().contains(B_ONLY.toString()));
            assertFalse(response.body().contains(A_NEW.toString()));
        }
    }

    @Test
    void tokenWhoseSubjectIsNotAUuidIsRejected() throws Exception {
        String token = TestTokens.sign(new MACSigner(SECRET), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().subject("service-account").build());

        assertEquals(401, TestTokens.get(port, "/api/items", token).statusCode());
    }

}
