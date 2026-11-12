package com.clothic.backend.item;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.clothic.backend.auth.TestTokens;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.crypto.MACSigner;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "clothic.auth.issuer=" + TestTokens.ISSUER,
        "clothic.auth.hmac-secret=" + CatalogItemApiTest.SECRET,
})
class CatalogItemFailureTest {
    @LocalServerPort private int port;
    @MockitoBean private CatalogItemService service;

    @Test
    void databaseFailureDoesNotExposeSqlOrCredentials() throws Exception {
        when(service.register(any(UUID.class), eq("top_001")))
                .thenThrow(new DataAccessResourceFailureException("insert into items password=private-role-password"));
        String token = TestTokens.sign(new MACSigner(CatalogItemApiTest.SECRET), JWSAlgorithm.HS256,
                null, TestTokens.supabaseClaims().build());
        try (HttpClient client = HttpClient.newHttpClient()) {
            HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/items"))
                    .header("Content-Type", "application/json").header("Authorization", "Bearer " + token)
                    .POST(HttpRequest.BodyPublishers.ofString("{\"catalogItemId\":\"top_001\"}")).build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            assertEquals(500, response.statusCode());
            assertFalse(response.body().contains("insert into"));
            assertFalse(response.body().contains("private-role-password"));
        }
    }
}
