package com.clothic.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import com.clothic.backend.item.TestDatabase;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * 자체 인증(S-02)을 서버 소유 스키마에서 실제 HTTP로 확인한다. 전환 전 Supabase 스키마에는 계정 열이 없어 실행하지 않는다.
 * 각 테스트는 고유한 이메일을 써서 서로와 다른 테스트 클래스에 영향을 주지 않는다.
 */
@EnabledIfSystemProperty(named = "clothic.test.schema", matches = "owned")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "clothic.auth.local.signing-secret=" + AuthApiTest.SECRET,
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.datasource.hikari.initialization-fail-timeout=1",
})
class AuthApiTest {

    static final String SECRET = "auth-api-test-only-signing-secret-with-at-least-32-bytes-0123456789";
    private static final String PASSWORD = "correct horse 1";
    private static final ObjectMapper JSON = new ObjectMapper();

    @DynamicPropertySource
    static void backendConnection(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> TestDatabase.jdbcUrl(TestDatabase.BACKEND_ROLE, TestDatabase.BACKEND_PASSWORD));
        registry.add("spring.datasource.username", () -> TestDatabase.BACKEND_ROLE);
        registry.add("spring.datasource.password", () -> TestDatabase.BACKEND_PASSWORD);
    }

    @LocalServerPort
    private int port;

    private final JdbcTemplate admin = new JdbcTemplate(TestDatabase.superuser());

    private static String newEmail() {
        return "user-" + UUID.randomUUID() + "@test.local";
    }

    private static String credentials(String email, String password) {
        return JSON.createObjectNode().put("email", email).put("password", password).toString();
    }

    private static String refreshBody(String refreshToken) {
        return JSON.createObjectNode().put("refreshToken", refreshToken).toString();
    }

    private HttpResponse<String> post(String path, String body) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .timeout(Duration.ofSeconds(10)).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body)).build();
        try (HttpClient client = HttpClient.newHttpClient()) {
            return client.send(request, HttpResponse.BodyHandlers.ofString());
        }
    }

    private JsonNode signup(String email) throws Exception {
        HttpResponse<String> response = post("/api/auth/signup", credentials(email, PASSWORD));
        assertEquals(201, response.statusCode(), response.body());
        return JSON.readTree(response.body());
    }

    private int get(String path, String accessToken) throws Exception {
        return TestTokens.get(port, path, accessToken).statusCode();
    }

    @Test
    void signupLoginRefreshAndLogoutWorkEndToEnd() throws Exception {
        String email = newEmail();

        JsonNode created = signup(email);
        String userId = created.get("userId").asString();
        assertEquals(email, created.get("email").asString());
        assertEquals(900, created.get("expiresIn").asLong());
        JsonNode me = JSON.readTree(TestTokens.get(port, "/api/me", created.get("accessToken").asString()).body());
        assertEquals(userId, me.get("userId").asString());
        assertEquals(200, get("/api/profile", created.get("accessToken").asString()), "가입하면 프로필 행이 함께 생긴다");
        assertEquals(200, get("/api/items", created.get("accessToken").asString()));

        HttpResponse<String> login = post("/api/auth/login", credentials(email, PASSWORD));
        assertEquals(200, login.statusCode());
        JsonNode session = JSON.readTree(login.body());
        assertEquals(userId, session.get("userId").asString());

        HttpResponse<String> refreshed = post("/api/auth/refresh", refreshBody(session.get("refreshToken").asString()));
        assertEquals(200, refreshed.statusCode());
        JsonNode next = JSON.readTree(refreshed.body());
        assertEquals(userId, next.get("userId").asString());
        assertEquals(email, next.get("email").asString());
        assertNotEquals(session.get("refreshToken").asString(), next.get("refreshToken").asString());
        assertEquals(200, get("/api/me", next.get("accessToken").asString()));
        assertEquals(401, post("/api/auth/refresh", refreshBody(session.get("refreshToken").asString())).statusCode(),
                "한 번 쓴 갱신 토큰은 다시 쓸 수 없다");

        assertEquals(204, post("/api/auth/logout", refreshBody(next.get("refreshToken").asString())).statusCode());
        assertEquals(401, post("/api/auth/refresh", refreshBody(next.get("refreshToken").asString())).statusCode());
        assertEquals(204, post("/api/auth/logout", refreshBody("unknown-token")).statusCode(),
                "로그아웃은 토큰의 유효 여부를 드러내지 않는다");
    }

    @Test
    void loginRejectsWrongPasswordAndUnknownEmailTheSameWay() throws Exception {
        String email = newEmail();
        signup(email);

        HttpResponse<String> wrongPassword = post("/api/auth/login", credentials(email, PASSWORD + "x"));
        HttpResponse<String> unknownEmail = post("/api/auth/login", credentials(newEmail(), PASSWORD));
        HttpResponse<String> tooLong = post("/api/auth/login", credentials(email, "가".repeat(30)));

        assertEquals(401, wrongPassword.statusCode());
        assertEquals(401, unknownEmail.statusCode());
        assertEquals(401, tooLong.statusCode());
        assertEquals(JSON.readTree(wrongPassword.body()).get("error"), JSON.readTree(unknownEmail.body()).get("error"));
        assertFalse(wrongPassword.body().contains("accessToken"));
    }

    @Test
    void emailIsCaseAndWhitespaceInsensitiveSoDuplicatesAreRejected() throws Exception {
        String email = newEmail();
        signup(email);

        String variant = "  " + email.toUpperCase() + " ";
        assertEquals(409, post("/api/auth/signup", credentials(variant, PASSWORD)).statusCode());
        assertEquals(409, post("/api/auth/signup", credentials(email, "another password")).statusCode());
        assertEquals(200, post("/api/auth/login", credentials(variant, PASSWORD)).statusCode());
        assertEquals(1, admin.queryForObject("select count(*) from public.users where email = ?", Integer.class, email));
    }

    @Test
    void concurrentSignupsWithTheSameEmailCreateExactlyOneAccount() throws Exception {
        String email = newEmail();
        Callable<Integer> attempt = () -> post("/api/auth/signup", credentials(email, PASSWORD)).statusCode();

        List<Integer> statuses;
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            List<Future<Integer>> futures = pool.invokeAll(List.of(attempt, attempt, attempt, attempt));
            statuses = futures.stream().map(future -> {
                try {
                    return future.get();
                } catch (Exception e) {
                    throw new IllegalStateException(e);
                }
            }).sorted().toList();
        }

        assertEquals(List.of(201, 409, 409, 409), statuses);
        assertEquals(1, admin.queryForObject("select count(*) from public.users where email = ?", Integer.class, email));
    }

    @Test
    void signupValidatesInputBeforeCreatingAnything() throws Exception {
        String email = newEmail();
        List<String> invalidBodies = List.of(
                credentials("not-an-email", PASSWORD),
                credentials("two@@test.local", PASSWORD),
                credentials("   ", PASSWORD),
                credentials(email, "12345"),
                credentials(email, "가".repeat(25)),
                "{\"email\":\"" + email + "\"}",
                "{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\",\"id\":\"" + UUID.randomUUID() + "\"}",
                "{\"email\":\"" + email + "\",\"password\":123456}",
                "{}",
                "not json");

        for (String body : invalidBodies) {
            assertEquals(400, post("/api/auth/signup", body).statusCode(), body);
        }
        assertEquals(400, post("/api/auth/refresh", "{\"refreshToken\":\"\"}").statusCode());
        assertEquals(400, post("/api/auth/refresh", "{\"token\":\"x\"}").statusCode());
        assertEquals(0, admin.queryForObject("select count(*) from public.users where email = ?", Integer.class, email));
        assertEquals(201, post("/api/auth/signup", credentials(email, "가나다라마바")).statusCode(),
                "앱과 같은 기준으로 6자 이상이면 받는다");
    }

    @Test
    void protectedPathsAcceptOnlyUnexpiredTokensSignedByThisServer() throws Exception {
        String userId = signup(newEmail()).get("userId").asString();
        Instant now = Instant.now();
        JWTClaimsSet.Builder valid = new JWTClaimsSet.Builder().issuer("clothic").audience("authenticated")
                .subject(userId).issueTime(Date.from(now.minusSeconds(5))).expirationTime(Date.from(now.plusSeconds(600)));
        MACSigner server = new MACSigner(SECRET);
        MACSigner other = new MACSigner("another-secret-with-at-least-32-bytes-0123456789-abcdefghij");

        assertEquals(200, get("/api/me", TestTokens.sign(server, JWSAlgorithm.HS256, null, valid.build())));
        assertEquals(401, get("/api/me", TestTokens.sign(other, JWSAlgorithm.HS256, null, valid.build())));
        assertEquals(401, get("/api/me", TestTokens.sign(server, JWSAlgorithm.HS256, null,
                valid.expirationTime(Date.from(now.minusSeconds(120))).build())));
        assertEquals(401, get("/api/me", TestTokens.sign(server, JWSAlgorithm.HS256, null,
                valid.expirationTime(Date.from(now.plusSeconds(600))).issuer("someone-else").build())));
        assertEquals(401, get("/api/me", TestTokens.sign(server, JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().subject(userId).build())), "Supabase 발급자 토큰은 받지 않는다");
        assertEquals(401, get("/api/me", null));
    }

    @Test
    void reusingAnOldRefreshTokenRevokesTheWholeLoginButAnImmediateRetryDoesNot() throws Exception {
        JsonNode first = signup(newEmail());
        String original = first.get("refreshToken").asString();
        String rotated = JSON.readTree(post("/api/auth/refresh", refreshBody(original)).body())
                .get("refreshToken").asString();

        assertEquals(401, post("/api/auth/refresh", refreshBody(original)).statusCode());
        HttpResponse<String> stillValid = post("/api/auth/refresh", refreshBody(rotated));
        assertEquals(200, stillValid.statusCode(), "폐기 직후의 재시도는 같은 기기의 동시 갱신으로 보고 로그인을 유지한다");
        String latest = JSON.readTree(stillValid.body()).get("refreshToken").asString();

        // 폐기된 지 오래된 토큰이 다시 쓰이면 탈취로 본다.
        admin.update("update public.refresh_tokens set revoked_at = now() - interval '1 minute' where token_hash = ?",
                AuthService.sha256(original));
        assertEquals(401, post("/api/auth/refresh", refreshBody(original)).statusCode());
        assertEquals(401, post("/api/auth/refresh", refreshBody(latest)).statusCode(),
                "같은 로그인에서 나온 최신 토큰도 함께 폐기된다");

        JsonNode otherLogin = signup(newEmail());
        assertEquals(200, post("/api/auth/refresh", refreshBody(otherLogin.get("refreshToken").asString())).statusCode(),
                "다른 사용자의 로그인은 영향이 없다");
    }

    @Test
    void expiredRefreshTokenIsRejected() throws Exception {
        String refreshToken = signup(newEmail()).get("refreshToken").asString();
        admin.update("update public.refresh_tokens set expires_at = now() - interval '1 second' where token_hash = ?",
                AuthService.sha256(refreshToken));

        assertEquals(401, post("/api/auth/refresh", refreshBody(refreshToken)).statusCode());
    }

    @Test
    void usersCreatedByTheServerOnlySeeTheirOwnData() throws Exception {
        JsonNode a = signup(newEmail());
        JsonNode b = signup(newEmail());
        admin.update("insert into public.items (user_id, name, category, color) values (?, '셔츠', 'top', '#FFFFFF')",
                UUID.fromString(a.get("userId").asString()));

        JsonNode itemsOfA = JSON.readTree(TestTokens.get(port, "/api/items", a.get("accessToken").asString()).body());
        JsonNode itemsOfB = JSON.readTree(TestTokens.get(port, "/api/items", b.get("accessToken").asString()).body());

        assertEquals(1, itemsOfA.size());
        assertEquals(a.get("userId").asString(), itemsOfA.get(0).get("userId").asString());
        assertEquals(0, itemsOfB.size());
    }

    @Test
    void passwordAndRefreshTokenAreNeverStoredOrReturnedInPlainText() throws Exception {
        String email = newEmail();
        HttpResponse<String> response = post("/api/auth/signup", credentials(email, PASSWORD));
        JsonNode body = JSON.readTree(response.body());
        String refreshToken = body.get("refreshToken").asString();

        String storedPassword = admin.queryForObject(
                "select password_hash from public.users where email = ?", String.class, email);
        List<String> storedTokens = admin.queryForList(
                "select token_hash from public.refresh_tokens where user_id = ?", String.class,
                UUID.fromString(body.get("userId").asString()));

        assertTrue(storedPassword.startsWith("$2"), "BCrypt 해시여야 한다");
        assertFalse(storedPassword.contains(PASSWORD));
        assertEquals(List.of(AuthService.sha256(refreshToken)), storedTokens);
        assertFalse(response.body().contains(PASSWORD));
        assertFalse(response.body().contains("password"));
    }
}
