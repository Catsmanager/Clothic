package com.clothic.backend.profile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
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

/** 격리된 PostgreSQL(가입 트리거 포함) + HS256 테스트 토큰으로 본인 프로필 조회·변경 계약을 확인한다. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "clothic.auth.issuer=" + TestTokens.ISSUER,
        "clothic.auth.hmac-secret=" + ProfileApiTest.SECRET,
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.datasource.hikari.initialization-fail-timeout=1",
})
class ProfileApiTest {

    static final String SECRET = "profile-api-test-only-secret-with-at-least-32-bytes-0123456789";

    private static final UUID USER_A = UUID.fromString("51111111-1111-4111-8111-111111111111");
    private static final UUID USER_B = UUID.fromString("52222222-2222-4222-8222-222222222222");
    private static final UUID USER_WITHOUT_PROFILE = UUID.fromString("59999999-9999-4999-8999-999999999999");
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
        TestDatabase.deleteUsers(USER_A, USER_B, USER_WITHOUT_PROFILE);
        // 계정 행이 생기면 트리거가 profiles 행을 만든다(두 스키마 공통).
        TestDatabase.insertUsers(USER_A, USER_B);
        assertEquals(Integer.valueOf(2), admin.queryForObject(
                "select count(*) from public.profiles where id in (?, ?)", Integer.class, USER_A, USER_B));
    }

    @LocalServerPort
    private int port;

    private static String tokenFor(UUID userId) throws Exception {
        return TestTokens.sign(new MACSigner(SECRET), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().subject(userId.toString()).build());
    }

    private HttpResponse<String> patch(String token, String body) throws Exception {
        try (HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()) {
            HttpRequest.Builder request = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:" + port + "/api/profile"))
                    .timeout(Duration.ofSeconds(5))
                    .header("Content-Type", "application/json")
                    .method("PATCH", HttpRequest.BodyPublishers.ofString(body));
            if (token != null) {
                request.header("Authorization", "Bearer " + token);
            }
            return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
        }
    }

    @Test
    void returnsOwnProfileWithTriggerDefaults() throws Exception {
        HttpResponse<String> response = TestTokens.get(port, "/api/profile", tokenFor(USER_B));

        assertEquals(200, response.statusCode());
        JsonNode body = JSON.readTree(response.body());
        assertEquals(USER_B.toString(), body.get("id").asString());
        assertTrue(body.get("username").isNull());
        assertTrue(body.get("dailyReminderEnabled").asBoolean());
        assertFalse(body.get("sleepingWardrobeEnabled").asBoolean());
        assertTrue(body.get("createdAt").isString());
    }

    @Test
    void updatesOnlyOwnSettingsAndPersistsThem() throws Exception {
        HttpResponse<String> updated = patch(tokenFor(USER_A), "{\"dailyReminderEnabled\":false,\"sleepingWardrobeEnabled\":true}");
        assertEquals(200, updated.statusCode());
        JsonNode body = JSON.readTree(updated.body());
        assertFalse(body.get("dailyReminderEnabled").asBoolean());
        assertTrue(body.get("sleepingWardrobeEnabled").asBoolean());

        JsonNode reread = JSON.readTree(TestTokens.get(port, "/api/profile", tokenFor(USER_A)).body());
        assertFalse(reread.get("dailyReminderEnabled").asBoolean());
        assertTrue(reread.get("sleepingWardrobeEnabled").asBoolean());

        HttpResponse<String> partial = patch(tokenFor(USER_A), "{\"dailyReminderEnabled\":true}");
        JsonNode afterPartial = JSON.readTree(partial.body());
        assertTrue(afterPartial.get("dailyReminderEnabled").asBoolean());
        assertTrue(afterPartial.get("sleepingWardrobeEnabled").asBoolean(), "보내지 않은 필드는 유지된다");

        JsonNode other = JSON.readTree(TestTokens.get(port, "/api/profile", tokenFor(USER_B)).body());
        assertTrue(other.get("dailyReminderEnabled").asBoolean(), "다른 사용자 프로필은 바뀌지 않는다");
        assertFalse(other.get("sleepingWardrobeEnabled").asBoolean());
    }

    @Test
    void rejectsEmptyUnknownAndMalformedUpdates() throws Exception {
        assertEquals(400, patch(tokenFor(USER_A), "{}").statusCode());
        assertEquals(400, patch(tokenFor(USER_A), "{\"id\":\"" + USER_B + "\",\"dailyReminderEnabled\":false}").statusCode(),
                "다른 사용자 ID 등 허용하지 않은 필드는 거부한다");
        assertEquals(400, patch(tokenFor(USER_A), "{\"username\":\"x\"}").statusCode());
        assertEquals(400, patch(tokenFor(USER_A), "{\"dailyReminderEnabled\":\"yes\"}").statusCode());
        assertEquals(400, patch(tokenFor(USER_A), "not json").statusCode());

        JsonNode unchanged = JSON.readTree(TestTokens.get(port, "/api/profile", tokenFor(USER_B)).body());
        assertTrue(unchanged.get("dailyReminderEnabled").asBoolean());
    }

    @Test
    void requiresAuthentication() throws Exception {
        assertEquals(401, TestTokens.get(port, "/api/profile", null).statusCode());
        assertEquals(401, patch(null, "{\"dailyReminderEnabled\":false}").statusCode());
    }

    @Test
    void missingProfileRowIsReportedNotCreated() throws Exception {
        assertEquals(404, TestTokens.get(port, "/api/profile", tokenFor(USER_WITHOUT_PROFILE)).statusCode());
        assertEquals(404, patch(tokenFor(USER_WITHOUT_PROFILE), "{\"dailyReminderEnabled\":false}").statusCode());

        JdbcTemplate admin = new JdbcTemplate(TestDatabase.superuser());
        assertEquals(Integer.valueOf(0), admin.queryForObject(
                "select count(*) from public.profiles where id = ?", Integer.class, USER_WITHOUT_PROFILE));
    }
}
