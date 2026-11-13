package com.clothic.backend.item;

import static org.junit.jupiter.api.Assertions.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "clothic.auth.issuer=" + TestTokens.ISSUER,
        "clothic.auth.hmac-secret=" + CatalogItemApiTest.SECRET,
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.datasource.hikari.initialization-fail-timeout=1",
})
class CatalogItemApiTest {

    static final String SECRET = "catalog-test-only-secret-with-at-least-32-bytes-0123456789";
    static final UUID USER_A = UUID.fromString("51111111-1111-4111-8111-111111111111");
    static final UUID USER_B = UUID.fromString("52222222-2222-4222-8222-222222222222");
    private static final ObjectMapper JSON = new ObjectMapper();

    @LocalServerPort private int port;

    @DynamicPropertySource
    static void connection(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> TestDatabase.jdbcUrl(TestDatabase.BACKEND_ROLE, TestDatabase.BACKEND_PASSWORD));
        registry.add("spring.datasource.username", () -> TestDatabase.BACKEND_ROLE);
        registry.add("spring.datasource.password", () -> TestDatabase.BACKEND_PASSWORD);
    }

    @BeforeAll
    static void users() {
        TestDatabase.insertUsers(USER_A, USER_B);
    }

    @BeforeEach
    void clearOwnedItems() {
        new JdbcTemplate(TestDatabase.superuser()).update(
                "delete from public.items where user_id in (?,?)", USER_A, USER_B);
    }

    private static String token(String subject) throws Exception {
        return TestTokens.sign(new MACSigner(SECRET), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().subject(subject).build());
    }

    private HttpResponse<String> post(String path, String body, String token) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .timeout(Duration.ofSeconds(10)).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body));
        if (token != null) request.header("Authorization", "Bearer " + token);
        try (HttpClient client = HttpClient.newHttpClient()) {
            return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
        }
    }

    private HttpResponse<String> add(UUID user) throws Exception {
        return post("/api/items", "{\"catalogItemId\":\"top_001\"}", token(user.toString()));
    }

    private int count(UUID user) {
        return new JdbcTemplate(TestDatabase.superuser()).queryForObject(
                "select count(*) from public.items where user_id=?", Integer.class, user);
    }

    @Test
    void createsOwnItemUsingServerMetadataAndCanReadItBack() throws Exception {
        HttpResponse<String> response = add(USER_A);
        assertEquals(201, response.statusCode());
        JsonNode item = JSON.readTree(response.body());
        assertDoesNotThrow(() -> UUID.fromString(item.get("id").asString()));
        assertEquals(USER_A.toString(), item.get("userId").asString());
        assertEquals("top_001", item.get("catalogItemId").asString());
        assertEquals("일반 나시", item.get("name").asString());
        assertEquals("assets/avatar/top/top_001_black.png", item.get("imagePath").asString());
        assertEquals("#24231F", item.get("color").asString());
        assertEquals(List.of("minimal", "chic"), JSON.convertValue(item.get("styleTags"), List.class));
        assertTrue(item.has("createdAt"));
        JsonNode list = JSON.readTree(TestTokens.get(port, "/api/items", token(USER_A.toString())).body());
        assertEquals(item, list.get(0));
        assertEquals(0, count(USER_B));
    }

    @Test
    void repeatedRegistrationReturnsTheSameRowWithoutOverwritingItsFields() throws Exception {
        JsonNode first = JSON.readTree(add(USER_A).body());
        new JdbcTemplate(TestDatabase.superuser()).update(
                "update public.items set name='사용자 기존 이름' where id=?", UUID.fromString(first.get("id").asString()));
        HttpResponse<String> repeated = add(USER_A);
        JsonNode item = JSON.readTree(repeated.body());
        assertEquals(200, repeated.statusCode());
        assertEquals(first.get("id"), item.get("id"));
        assertEquals(first.get("createdAt"), item.get("createdAt"));
        assertEquals("사용자 기존 이름", item.get("name").asString());
        assertEquals(1, count(USER_A));
    }

    @Test
    void anotherUserGetsADifferentOwnedRowForTheSameTemplate() throws Exception {
        JsonNode a = JSON.readTree(add(USER_A).body());
        JsonNode b = JSON.readTree(add(USER_B).body());
        assertNotEquals(a.get("id"), b.get("id"));
        assertEquals(USER_B.toString(), b.get("userId").asString());
        JsonNode bList = JSON.readTree(TestTokens.get(port, "/api/items", token(USER_B.toString())).body());
        assertEquals(1, bList.size());
        assertEquals(b.get("id"), bList.get(0).get("id"));
    }

    @Test
    void concurrentRegistrationsCreateExactlyOneRow() throws Exception {
        List<Callable<HttpResponse<String>>> requests = new ArrayList<>();
        for (int i = 0; i < 4; i++) requests.add(() -> add(USER_A));
        var ids = new HashSet<String>();
        int created = 0;
        try (var executor = Executors.newFixedThreadPool(4)) {
            for (var future : executor.invokeAll(requests)) {
                HttpResponse<String> response = future.get();
                assertTrue(response.statusCode() == 200 || response.statusCode() == 201, response.body());
                if (response.statusCode() == 201) created++;
                ids.add(JSON.readTree(response.body()).get("id").asString());
            }
        }
        assertEquals(1, created);
        assertEquals(1, ids.size());
        assertEquals(1, count(USER_A));
    }

    @Test
    void rejectsUnknownCatalogAndClientSuppliedOwnershipOrMetadata() throws Exception {
        for (String body : List.of("{}", "null", "[]", "not-json",
                "{\"catalogItemId\":42}", "{\"catalogItemId\":\"unknown\"}",
                "{\"catalogItemId\":\"top_001\",\"userId\":\"" + USER_B + "\"}",
                "{\"catalogItemId\":\"top_001\",\"name\":\"tampered\"}")) {
            assertEquals(400, post("/api/items", body, token(USER_A.toString())).statusCode(), body);
        }
        assertEquals(0, count(USER_A));
        assertEquals(0, count(USER_B));
    }

    @Test
    void missingOrForgedTokenCannotCreateRows() throws Exception {
        String body = "{\"catalogItemId\":\"top_001\"}";
        assertEquals(401, post("/api/items", body, null).statusCode());
        assertEquals(401, post("/api/items", body, "not-a-token").statusCode());
        assertEquals(0, count(USER_A));
    }

    @Test
    void targetUserParametersAndNonUuidSubjectsAreRejected() throws Exception {
        String body = "{\"catalogItemId\":\"top_001\"}";
        assertEquals(400, post("/api/items?userId=" + USER_B, body, token(USER_A.toString())).statusCode());
        assertEquals(401, post("/api/items", body, token("not-a-user-uuid")).statusCode());
        assertEquals(0, count(USER_A));
        assertEquals(0, count(USER_B));
    }

    @Test
    void legacyOwnedRowsWithoutCatalogIdsRemainUnchanged() throws Exception {
        UUID legacy = UUID.randomUUID();
        new JdbcTemplate(TestDatabase.superuser()).update(
                "insert into public.items (id,user_id,name,category,image_path,color,style_tags) values (?,?,'기존 옷','top','','#000000',array['casual'])",
                legacy, USER_A);
        assertEquals(201, add(USER_A).statusCode());
        assertEquals(2, count(USER_A));
        JdbcTemplate admin = new JdbcTemplate(TestDatabase.superuser());
        assertNull(admin.queryForObject("select catalog_item_id from public.items where id=?", String.class, legacy));
        assertEquals("기존 옷", admin.queryForObject("select name from public.items where id=?", String.class, legacy));
    }
}
