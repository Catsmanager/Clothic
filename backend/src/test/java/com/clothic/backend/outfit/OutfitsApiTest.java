package com.clothic.backend.outfit;

import static org.junit.jupiter.api.Assertions.*;

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
import com.clothic.backend.item.TestDatabase;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.crypto.MACSigner;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "clothic.auth.issuer=" + TestTokens.ISSUER,
        "clothic.auth.hmac-secret=" + OutfitsApiTest.SECRET,
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.datasource.hikari.initialization-fail-timeout=1",
})
class OutfitsApiTest {
    static final String SECRET = "outfits-api-test-only-secret-with-at-least-32-bytes-0123456789";
    private static final UUID A = UUID.fromString("81111111-1111-4111-8111-111111111111");
    private static final UUID B = UUID.fromString("82222222-2222-4222-8222-222222222222");
    private static final UUID EMPTY = UUID.fromString("83333333-3333-4333-8333-333333333333");
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
        admin.update("insert into auth.users (id, email) values (?, ?), (?, ?), (?, ?)",
                A, "outfits-a@test.local", B, "outfits-b@test.local", EMPTY, "outfits-empty@test.local");
        String sql = """
                insert into public.outfits (id,user_id,date,mood,weather,memo,item_ids,item_colors,is_favorite,created_at)
                values (?::uuid,?,?::date,?,?,?,?::text[],?::jsonb,?,?)
                """;
        // 생성일이 더 늦어도 착장 날짜가 이르면 뒤에 온다. 같은 날짜·생성일은 ID로 안정 정렬한다.
        admin.update(sql, "8aaaaaaa-0000-4000-8000-000000000004", A, "2026-02-28", null, null, null,
                "{}", "{}", false, OffsetDateTime.parse("2026-03-04T00:00:00Z"));
        admin.update(sql, "8aaaaaaa-0000-4000-8000-000000000003", A, "2026-03-01", "historical-mood", "sunny", "한글 메모\n둘째 줄",
                "{top_001,41111111-1111-4111-8111-111111111111,deleted-legacy-id}",
                "{\"top_001\":\"#ABCDEF\",\"41111111-1111-4111-8111-111111111111\":\"#000000\"}", true,
                OffsetDateTime.parse("2026-03-01T09:00:00.123456+09:00"));
        for (String suffix : List.of("000000000002", "000000000001")) {
            admin.update(sql, "8aaaaaaa-0000-4000-8000-" + suffix, A, "2026-03-01", "calm", "cloudy", "",
                    "{}", "{}", false, OffsetDateTime.parse("2026-03-02T00:00:00Z"));
        }
        admin.update(sql, "8bbbbbbb-0000-4000-8000-000000000001", B, "2026-03-09", null, null, "B only",
                "{top_002}", "{}", false, OffsetDateTime.parse("2026-03-09T00:00:00Z"));
    }

    @LocalServerPort
    private int port;

    private static String token(UUID user) throws Exception {
        return TestTokens.sign(new MACSigner(SECRET), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().subject(user.toString()).build());
    }

    @Test
    void listPreservesFieldsLegacyIdsColorsAndDateOrdering() throws Exception {
        HttpResponse<String> response = TestTokens.get(port, "/api/outfits", token(A));
        assertEquals(200, response.statusCode());
        assertTrue(response.headers().firstValue("content-type").orElse("").startsWith("application/json"));
        JsonNode rows = JSON.readTree(response.body());
        assertEquals(4, rows.size());
        assertEquals("8aaaaaaa-0000-4000-8000-000000000001", rows.get(0).get("id").asString());
        assertEquals("8aaaaaaa-0000-4000-8000-000000000002", rows.get(1).get("id").asString());
        JsonNode row = rows.get(2);
        assertEquals(A.toString(), row.get("userId").asString());
        assertEquals("2026-03-01", row.get("date").asString());
        assertEquals("historical-mood", row.get("mood").asString());
        assertEquals("sunny", row.get("weather").asString());
        assertEquals("한글 메모\n둘째 줄", row.get("memo").asString());
        assertEquals(List.of("top_001", "41111111-1111-4111-8111-111111111111", "deleted-legacy-id"),
                JSON.convertValue(row.get("itemIds"), List.class));
        assertEquals(Map.of("top_001", "#ABCDEF", "41111111-1111-4111-8111-111111111111", "#000000"),
                JSON.convertValue(row.get("itemColors"), Map.class));
        assertTrue(row.get("isFavorite").asBoolean());
        assertEquals(Instant.parse("2026-03-01T00:00:00.123456Z"), Instant.parse(row.get("createdAt").asString()));
        assertTrue(rows.get(3).get("mood").isNull());
        assertTrue(rows.get(3).get("weather").isNull());
        assertTrue(rows.get(3).get("memo").isNull());
        assertEquals(0, rows.get(3).get("itemIds").size());
        assertEquals(0, rows.get(3).get("itemColors").size());
        assertFalse(rows.get(3).get("isFavorite").asBoolean());
        assertEquals(List.of("id", "userId", "date", "mood", "weather", "memo", "itemIds", "itemColors", "isFavorite", "createdAt"),
                List.copyOf(JSON.convertValue(row, java.util.LinkedHashMap.class).keySet()));
    }

    @Test
    void otherUserCannotSeeFirstUsersRows() throws Exception {
        JsonNode rows = JSON.readTree(TestTokens.get(port, "/api/outfits", token(B)).body());
        assertEquals(1, rows.size());
        assertEquals(B.toString(), rows.get(0).get("userId").asString());
        assertEquals("B only", rows.get(0).get("memo").asString());
    }

    @Test
    void noOutfitsReturnsEmptyArray() throws Exception {
        var response = TestTokens.get(port, "/api/outfits", token(EMPTY));
        assertEquals(200, response.statusCode());
        assertEquals("[]", response.body());
    }

    @Test
    void missingAndForgedTokensAreRejected() throws Exception {
        assertEquals(401, TestTokens.get(port, "/api/outfits", null).statusCode());
        String forged = TestTokens.sign(new MACSigner("wrong-outfits-key-at-least-32-bytes-0123456789"), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().subject(A.toString()).build());
        assertEquals(401, TestTokens.get(port, "/api/outfits", forged).statusCode());
    }

    @Test
    void userParametersCannotOverrideTokenOwner() throws Exception {
        for (String parameter : List.of("userId", "user_id")) {
            var response = TestTokens.get(port, "/api/outfits?" + parameter + "=" + B, token(A));
            assertEquals(400, response.statusCode());
            assertFalse(response.body().contains("B only"));
        }
    }

    @Test
    void nonUuidSubjectIsUnauthorized() throws Exception {
        String invalid = TestTokens.sign(new MACSigner(SECRET), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().subject("not-a-user").build());
        assertEquals(401, TestTokens.get(port, "/api/outfits", invalid).statusCode());
    }

    @Test
    void detailMatchesSameRowInListIncludingLegacyIdsAndColors() throws Exception {
        String id = "8aaaaaaa-0000-4000-8000-000000000003";
        var response = TestTokens.get(port, "/api/outfits/" + id, token(A));
        assertEquals(200, response.statusCode());
        JsonNode detail = JSON.readTree(response.body());
        JsonNode listed = JSON.readTree(TestTokens.get(port, "/api/outfits", token(A)).body()).get(2);
        assertEquals(listed, detail);
        assertEquals(detail, JSON.readTree(TestTokens.get(port, "/api/outfits/" + id.toUpperCase(), token(A)).body()));
    }

    @Test
    void detailNeverRevealsAnotherUsersRecord() throws Exception {
        String other = "8bbbbbbb-0000-4000-8000-000000000001";
        for (String id : List.of(other, "8fffffff-0000-4000-8000-000000000001")) {
            var response = TestTokens.get(port, "/api/outfits/" + id, token(A));
            assertEquals(404, response.statusCode());
            assertFalse(response.body().contains("B only"));
            assertFalse(response.body().contains(B.toString()));
            assertFalse(response.body().contains("itemIds"));
        }
        assertEquals(404, TestTokens.get(port, "/api/outfits/8aaaaaaa-0000-4000-8000-000000000003", token(EMPTY)).statusCode());
    }

    @Test
    void malformedDetailIdsAreBadRequests() throws Exception {
        for (String id : List.of("not-a-uuid", "1-1-1-1-1", "8aaaaaaa000040008000000000000003")) {
            assertEquals(400, TestTokens.get(port, "/api/outfits/" + id, token(A)).statusCode());
        }
    }

    @Test
    void detailRequiresValidTokenAndUuidSubject() throws Exception {
        String path = "/api/outfits/8aaaaaaa-0000-4000-8000-000000000003";
        assertEquals(401, TestTokens.get(port, path, null).statusCode());
        String forged = TestTokens.sign(new MACSigner("wrong-outfits-key-at-least-32-bytes-0123456789"), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().subject(A.toString()).build());
        assertEquals(401, TestTokens.get(port, path, forged).statusCode());
        String invalid = TestTokens.sign(new MACSigner(SECRET), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().subject("not-a-user").build());
        assertEquals(401, TestTokens.get(port, path, invalid).statusCode());
    }

    @Test
    void detailUserParametersCannotOverrideOwnership() throws Exception {
        for (String parameter : List.of("userId", "user_id")) {
            var response = TestTokens.get(port, "/api/outfits/8bbbbbbb-0000-4000-8000-000000000001?" + parameter + "=" + B, token(A));
            assertEquals(400, response.statusCode());
            assertFalse(response.body().contains("B only"));
        }
    }
}
