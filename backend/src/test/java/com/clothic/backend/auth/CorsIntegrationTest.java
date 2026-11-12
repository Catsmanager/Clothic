package com.clothic.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.crypto.MACSigner;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "clothic.auth.issuer=" + TestTokens.ISSUER,
        "clothic.auth.hmac-secret=" + HmacTokenVerificationTest.SECRET,
        "clothic.web.allowed-origins=http://localhost:8081",
})
class CorsIntegrationTest {

    private static final String ORIGIN = "http://localhost:8081";

    @LocalServerPort
    private int port;

    private HttpResponse<String> send(HttpRequest.Builder request) throws Exception {
        try (HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()) {
            return client.send(request.timeout(Duration.ofSeconds(5)).build(), HttpResponse.BodyHandlers.ofString());
        }
    }

    private HttpResponse<String> preflight(String origin, String method) throws Exception {
        return send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/items"))
                .header("Origin", origin)
                .header("Access-Control-Request-Method", method)
                .header("Access-Control-Request-Headers", "authorization,content-type")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody()));
    }

    @Test
    void configuredOriginCanPreflightWithoutToken() throws Exception {
        HttpResponse<String> response = preflight(ORIGIN, "GET");

        assertEquals(200, response.statusCode());
        assertEquals(ORIGIN, response.headers().firstValue("Access-Control-Allow-Origin").orElseThrow());
        assertTrue(response.headers().firstValue("Access-Control-Allow-Headers").orElseThrow()
                .toLowerCase().contains("authorization"));
        assertFalse(response.headers().firstValue("Access-Control-Allow-Credentials").isPresent());
    }

    @Test
    void unconfiguredOriginIsRejected() throws Exception {
        HttpResponse<String> response = preflight("https://untrusted.example", "GET");

        assertEquals(403, response.statusCode());
        assertFalse(response.headers().firstValue("Access-Control-Allow-Origin").isPresent());
    }

    @Test
    void configuredOriginStillNeedsAValidToken() throws Exception {
        HttpResponse<String> response = send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/me"))
                .header("Origin", ORIGIN).GET());

        assertEquals(401, response.statusCode());
        assertEquals(ORIGIN, response.headers().firstValue("Access-Control-Allow-Origin").orElseThrow());
    }

    @Test
    void authenticatedBrowserRequestReturnsUserAndOrigin() throws Exception {
        String token = TestTokens.sign(new MACSigner(HmacTokenVerificationTest.SECRET), JWSAlgorithm.HS256,
                null, TestTokens.supabaseClaims().build());
        HttpResponse<String> response = send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/me"))
                .header("Origin", ORIGIN).header("Authorization", "Bearer " + token).GET());

        assertEquals(200, response.statusCode());
        assertEquals("{\"userId\":\"" + TestTokens.USER_ID + "\"}", response.body());
        assertEquals(ORIGIN, response.headers().firstValue("Access-Control-Allow-Origin").orElseThrow());
    }

    @Test
    void unsupportedMethodCannotPreflight() throws Exception {
        assertEquals(403, preflight(ORIGIN, "TRACE").statusCode());
    }
}
