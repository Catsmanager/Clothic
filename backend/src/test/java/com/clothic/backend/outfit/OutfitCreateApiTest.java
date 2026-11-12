package com.clothic.backend.outfit;

import java.util.LinkedHashMap;
import java.util.Map;
import com.clothic.backend.item.TestDatabase;

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
        "clothic.auth.hmac-secret=" + OutfitCreateApiTest.SECRET,
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.datasource.hikari.initialization-fail-timeout=1",
})
class OutfitCreateApiTest {

    static final String SECRET = "catalog-test-only-secret-with-at-least-32-bytes-0123456789";
    static final UUID USER_A = UUID.fromString("a1111111-1111-4111-8111-111111111111");
    static final UUID USER_B = UUID.fromString("a2222222-2222-4222-8222-222222222222");
    private static final ObjectMapper JSON = new ObjectMapper();

    private static final String OWNED = "ab111111-1111-4111-8111-111111111111";
    @LocalServerPort private int port;

    @DynamicPropertySource
    static void connection(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> TestDatabase.jdbcUrl(TestDatabase.BACKEND_ROLE, TestDatabase.BACKEND_PASSWORD));
        registry.add("spring.datasource.username", () -> TestDatabase.BACKEND_ROLE);
        registry.add("spring.datasource.password", () -> TestDatabase.BACKEND_PASSWORD);
    }

    @BeforeAll
    static void users() {
        new JdbcTemplate(TestDatabase.superuser()).update(
                "insert into auth.users (id,email) values (?,?), (?,?) on conflict (id) do nothing",
                USER_A, "create-a@test.local", USER_B, "create-b@test.local");
    }

    @BeforeEach
    void clearFixtures() {
        JdbcTemplate admin = new JdbcTemplate(TestDatabase.superuser());
        admin.update("delete from public.outfits where user_id in (?,?)", USER_A, USER_B);
        admin.update("delete from public.items where user_id in (?,?)", USER_A, USER_B);
        admin.update("insert into public.items (id,user_id,name,category,color) values (?::uuid,?,'owned','top','#000000')", OWNED, USER_A);
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

    private static Map<String,Object> input() {
        Map<String,Object> value = new LinkedHashMap<>();
        value.put("requestId", UUID.randomUUID().toString()); value.put("date", "2024-02-29");
        value.put("mood", "calm"); value.put("weather", "rainy"); value.put("memo", "한글 메모\n둘째 줄");
        value.put("itemIds", List.of("top_001", OWNED));
        value.put("itemColors", Map.of("top_001", "#ABCDEF", OWNED, "#123456"));
        return value;
    }
    private HttpResponse<String> save(UUID user, Map<String,Object> body) throws Exception {
        return post("/api/outfits", JSON.writeValueAsString(body), token(user.toString()));
    }
    private int count(UUID user) {
        return new JdbcTemplate(TestDatabase.superuser()).queryForObject("select count(*) from public.outfits where user_id=?", Integer.class, user);
    }
    @Test
    void savesAllFieldsUnderTokenOwnerAndCanReadBack() throws Exception {
        var input = input(); var response = save(USER_A, input); assertEquals(201, response.statusCode());
        JsonNode row=JSON.readTree(response.body());
        assertEquals(input.get("requestId"),row.get("id").asString()); assertEquals(USER_A.toString(),row.get("userId").asString());
        for(String field:List.of("date","mood","weather","memo","itemIds","itemColors")) assertEquals(JSON.valueToTree(input.get(field)),row.get(field),field);
        assertFalse(row.get("isFavorite").asBoolean()); assertTrue(row.has("createdAt"));
        String jwt=token(USER_A.toString());
        assertEquals(row,JSON.readTree(TestTokens.get(port,"/api/outfits/"+input.get("requestId"),jwt).body()));
        assertEquals(row,JSON.readTree(TestTokens.get(port,"/api/outfits",jwt).body()).get(0));
        assertEquals(1,count(USER_A)); assertEquals(0,count(USER_B));
    }
    @Test
    void replayPreservesRowAndChangedPayloadConflicts() throws Exception {
        var input=input(); var first=save(USER_A,input); var retry=save(USER_A,input);
        assertEquals(201,first.statusCode()); assertEquals(200,retry.statusCode()); assertEquals(JSON.readTree(first.body()),JSON.readTree(retry.body()));
        input.put("memo","다른 내용"); assertEquals(409,save(USER_A,input).statusCode()); assertEquals(1,count(USER_A));
        assertEquals(JSON.readTree(first.body()),JSON.readTree(TestTokens.get(port,"/api/outfits/"+input.get("requestId"),token(USER_A.toString())).body()));
    }
    @Test
    void sameDaySeparateRequestsAndNullableFieldsAreAllowed() throws Exception {
        var first=input(); var second=input(); second.put("mood",null); second.put("weather",null); second.put("memo",null); second.put("itemColors",Map.of());
        assertEquals(201,save(USER_A,first).statusCode()); var response=save(USER_A,second); assertEquals(201,response.statusCode());
        JsonNode row=JSON.readTree(response.body());
        for(String key:List.of("mood","weather","memo")) assertTrue(row.get(key).isNull());
        assertEquals(0,row.get("itemColors").size()); assertEquals(2,count(USER_A));
    }
    @Test
    void concurrentRetriesCreateExactlyOneRow() throws Exception {
        var input=input(); try(var pool=Executors.newFixedThreadPool(4)) {
            List<Callable<HttpResponse<String>>> calls=new ArrayList<>(); for(int i=0;i<4;i++) calls.add(()->save(USER_A,input));
            int created=0; for(var future:pool.invokeAll(calls)) {
                var response=future.get(); assertTrue(response.statusCode()==201||response.statusCode()==200);
                if(response.statusCode()==201) created++;
                assertEquals(input.get("requestId"),JSON.readTree(response.body()).get("id").asString());
            }
            assertEquals(1,created); assertEquals(1,count(USER_A));
        }
    }
    @Test
    void unavailableItemsAndCrossOwnerRequestCollisionCannotLeakRows() throws Exception {
        var input=input(); assertEquals(400,save(USER_B,input).statusCode());
        for(String id:List.of("not-a-template","ffffffff-ffff-4fff-8fff-ffffffffffff")) {
            var bad=input(); bad.put("itemIds",List.of(id)); bad.put("itemColors",Map.of()); assertEquals(400,save(USER_A,bad).statusCode());
        }
        assertEquals(201,save(USER_A,input).statusCode()); input.put("itemIds",List.of("top_001")); input.put("itemColors",Map.of());
        var collision=save(USER_B,input); assertEquals(409,collision.statusCode());
        assertFalse(collision.body().contains("한글 메모")); assertFalse(collision.body().contains(USER_A.toString())); assertEquals(0,count(USER_B));
    }
    @Test
    void validatesAllInputFieldsBeforeWriting() throws Exception {
        List<Map<String,Object>> invalid=new ArrayList<>();
        for(var change:List.of(Map.entry("date",(Object)"2026-02-29"),Map.entry("date",(Object)"2026-2-01"),Map.entry("date",(Object)"0000-01-01"),
                Map.entry("mood",(Object)"unknown"),Map.entry("weather",(Object)false),Map.entry("memo",(Object)"a".repeat(101)),
                Map.entry("itemIds",(Object)List.of()),Map.entry("itemIds",(Object)List.of("top_001","top_001")),Map.entry("itemIds",(Object)List.of(1)),
                Map.entry("itemColors",(Object)Map.of("other","#123456")),Map.entry("itemColors",(Object)Map.of("top_001","red")),Map.entry("requestId",(Object)"1-1-1-1-1"))) {
            var bad=input(); bad.put(change.getKey(),change.getValue()); invalid.add(bad);
        }
        for(String key:List.of("userId","user_id","id","isFavorite","createdAt","extra")) {var bad=input();bad.put(key,"forged");invalid.add(bad);}
        var missing=input(); missing.remove("requestId"); invalid.add(missing);
        for(var bad:invalid) assertEquals(400,save(USER_A,bad).statusCode(),bad.toString());
        for(String body:List.of("null","[]","not-json")) assertEquals(400,post("/api/outfits",body,token(USER_A.toString())).statusCode());
        assertEquals(0,count(USER_A));
    }
    @Test
    void rejectsInvalidAuthenticationAndOwnerOverrides() throws Exception {
        String body=JSON.writeValueAsString(input()); assertEquals(401,post("/api/outfits",body,null).statusCode());
        String forged=TestTokens.sign(new MACSigner("wrong-save-key-at-least-32-bytes-0123456789"),JWSAlgorithm.HS256,null,TestTokens.supabaseClaims().subject(USER_A.toString()).build());
        assertEquals(401,post("/api/outfits",body,forged).statusCode()); assertEquals(401,post("/api/outfits",body,token("not-a-user")).statusCode());
        for(String key:List.of("userId","user_id")) assertEquals(400,post("/api/outfits?"+key+"="+USER_B,body,token(USER_A.toString())).statusCode());
        assertEquals(0,count(USER_A)); assertEquals(0,count(USER_B));
    }
    @Test
    void preservesLegacyAndDiaryOnlyRows() throws Exception {
        String id=UUID.randomUUID().toString(); new JdbcTemplate(TestDatabase.superuser()).update("insert into public.outfits(id,user_id,date,mood,memo,item_ids) values (?::uuid,?,'2020-01-01','legacy','old','{}')",id,USER_A);
        String jwt=token(USER_A.toString()); var before=TestTokens.get(port,"/api/outfits/"+id,jwt).body(); assertEquals(201,save(USER_A,input()).statusCode());
        assertEquals(JSON.readTree(before),JSON.readTree(TestTokens.get(port,"/api/outfits/"+id,jwt).body()));
    }
}
