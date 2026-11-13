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
        "clothic.auth.hmac-secret=" + OutfitDiaryApiTest.SECRET,
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.datasource.hikari.initialization-fail-timeout=1",
})
class OutfitDiaryApiTest {

    static final String SECRET = "catalog-test-only-secret-with-at-least-32-bytes-0123456789";
    static final UUID USER_A = UUID.fromString("b1111111-1111-4111-8111-111111111111");
    static final UUID USER_B = UUID.fromString("b2222222-2222-4222-8222-222222222222");
    private static final ObjectMapper JSON = new ObjectMapper();

    private static final String OWNED = "bc111111-1111-4111-8111-111111111111";
    private static final String OUTFIT_A="ba111111-1111-4111-8111-111111111111";
    private static final String OUTFIT_B="bb222222-2222-4222-8222-222222222222";
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
    void clearFixtures() {
        JdbcTemplate admin = new JdbcTemplate(TestDatabase.superuser());
        admin.update("delete from public.outfits where user_id in (?,?)", USER_A, USER_B);
        admin.update("delete from public.items where user_id in (?,?)", USER_A, USER_B);
        admin.update("insert into public.items (id,user_id,name,category,color) values (?::uuid,?,'owned','top','#000000')", OWNED, USER_A);
        String sql="insert into public.outfits(id,user_id,date,mood,weather,memo,item_ids,item_colors,is_favorite,created_at) values (?::uuid,?,'2026-11-12','calm','rainy','초기 메모',?::text[],?::jsonb,true,'2026-11-12T00:00:00Z')";
        admin.update(sql,OUTFIT_A,USER_A,"{top_001,deleted-legacy-id}","{\"top_001\":\"#ABCDEF\"}");
        admin.update(sql,OUTFIT_B,USER_B,"{top_002}","{}");
    }

    private static String token(String subject) throws Exception {
        return TestTokens.sign(new MACSigner(SECRET), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().subject(subject).build());
    }

    private HttpResponse<String> patch(String path, String body, String token) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .timeout(Duration.ofSeconds(10)).header("Content-Type", "application/json")
                .method("PATCH", HttpRequest.BodyPublishers.ofString(body));
        if (token != null) request.header("Authorization", "Bearer " + token);
        try (HttpClient client = HttpClient.newHttpClient()) {
            return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
        }
    }

    private HttpResponse<String> change(String id,String body) throws Exception {
        return patch("/api/outfits/"+id,body,token(USER_A.toString()));
    }
    private JsonNode get(String id,UUID user) throws Exception {
        return JSON.readTree(TestTokens.get(port,"/api/outfits/"+id,token(user.toString())).body());
    }

    @Test
    void updatesDiaryAndPreservesEveryOtherField() throws Exception {
        JsonNode before=get(OUTFIT_A,USER_A);
        var response=change(OUTFIT_A,"{\"mood\":\"happy\",\"memo\":\"수정한 메모\"}");
        assertEquals(200,response.statusCode());JsonNode after=JSON.readTree(response.body());
        assertEquals("happy",after.get("mood").asString());assertEquals("수정한 메모",after.get("memo").asString());
        for(String key:List.of("id","userId","date","weather","itemIds","itemColors","isFavorite","createdAt")) assertEquals(before.get(key),after.get(key),key);
        assertEquals(after,get(OUTFIT_A,USER_A));
        assertEquals(after,JSON.readTree(TestTokens.get(port,"/api/outfits",token(USER_A.toString())).body()).get(0));
    }

    @Test
    void absentFieldsStayUnchangedAndNullClearsOnlyTheProvidedField() throws Exception {
        var mood=change(OUTFIT_A,"{\"mood\":null}");assertEquals(200,mood.statusCode());
        JsonNode first=JSON.readTree(mood.body());assertTrue(first.get("mood").isNull());assertEquals("초기 메모",first.get("memo").asString());
        var memo=change(OUTFIT_A,"{\"memo\":\"   \"}");assertEquals(200,memo.statusCode());
        JsonNode second=JSON.readTree(memo.body());assertTrue(second.get("mood").isNull());assertTrue(second.get("memo").isNull());
        assertEquals(second,JSON.readTree(change(OUTFIT_A,"{\"memo\":null}").body()));
    }

    @Test
    void otherUsersAndMissingRowsHaveSameNotFoundResultAndStayUnchanged() throws Exception {
        JsonNode before=get(OUTFIT_B,USER_B);
        for(String id:List.of(OUTFIT_B,"ffffffff-ffff-4fff-8fff-ffffffffffff")){
            var response=change(id,"{\"mood\":\"happy\"}");assertEquals(404,response.statusCode());
            assertFalse(response.body().contains("초기 메모"));assertFalse(response.body().contains(USER_B.toString()));
        }
        assertEquals(before,get(OUTFIT_B,USER_B));
    }

    @Test
    void validatesThePartialContractWithoutWriting() throws Exception {
        JsonNode before=get(OUTFIT_A,USER_A);
        for(String body:List.of("{}","null","[]","not-json","{\"mood\":false}","{\"mood\":\"unknown\"}","{\"memo\":5}","{\"memo\":\""+"x".repeat(101)+"\"}")) assertEquals(400,change(OUTFIT_A,body).statusCode(),body);
        for(String key:List.of("id","userId","user_id","date","weather","itemIds","itemColors","isFavorite","createdAt","extra")) {
            assertEquals(400,change(OUTFIT_A,JSON.writeValueAsString(Map.of("memo","수정",key,"forged"))).statusCode(),key);
        }
        assertEquals(before,get(OUTFIT_A,USER_A));
    }

    @Test
    void validatesTokensIdsAndOwnerQueriesBeforeUpdating() throws Exception {
        String body="{\"memo\":\"수정\"}",path="/api/outfits/"+OUTFIT_A;
        assertEquals(401,patch(path,body,null).statusCode());
        String forged=TestTokens.sign(new MACSigner("wrong-diary-key-at-least-32-bytes-0123456789"),JWSAlgorithm.HS256,null,TestTokens.supabaseClaims().subject(USER_A.toString()).build());
        assertEquals(401,patch(path,body,forged).statusCode());assertEquals(401,patch(path,body,token("not-a-user")).statusCode());
        for(String id:List.of("not-a-uuid","1-1-1-1-1")) assertEquals(400,change(id,body).statusCode());
        for(String key:List.of("userId","user_id")) assertEquals(400,patch(path+"?"+key+"="+USER_B,body,token(USER_A.toString())).statusCode());
        assertEquals("초기 메모",get(OUTFIT_A,USER_A).get("memo").asString());
    }

    @Test
    void changingOneFieldDoesNotInvalidateUnchangedLegacyValues() throws Exception {
        JdbcTemplate admin=new JdbcTemplate(TestDatabase.superuser());
        admin.update("update public.outfits set mood='historical',memo=? where id=?::uuid","x".repeat(150),OUTFIT_A);
        assertEquals(200,change(OUTFIT_A,"{\"memo\":\"새 메모\"}").statusCode());
        assertEquals("historical",get(OUTFIT_A,USER_A).get("mood").asString());
        admin.update("update public.outfits set memo=? where id=?::uuid","x".repeat(150),OUTFIT_A);
        assertEquals(200,change(OUTFIT_A,"{\"mood\":\"happy\"}").statusCode());
        assertEquals(150,get(OUTFIT_A,USER_A).get("memo").asString().length());
    }
}
