package com.clothic.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.crypto.ECDSASigner;
import com.nimbusds.jose.jwk.Curve;
import com.nimbusds.jose.jwk.ECKey;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.gen.ECKeyGenerator;
import com.sun.net.httpserver.HttpServer;

/** 비대칭 서명(ES256) 설정에서 JWKS 공개키로 토큰을 검증하는지 확인한다. JWKS는 테스트가 띄운 로컬 HTTP 서버가 제공한다. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "clothic.auth.issuer=" + TestTokens.ISSUER,
})
class JwksTokenVerificationTest {

    private static final ECKey SIGNING_KEY;
    private static final ECKey OTHER_KEY;
    private static final HttpServer JWKS_SERVER;

    static {
        try {
            SIGNING_KEY = new ECKeyGenerator(Curve.P_256).keyID("test-key-1").generate();
            OTHER_KEY = new ECKeyGenerator(Curve.P_256).keyID("test-key-1").generate();
            byte[] jwks = new JWKSet(SIGNING_KEY.toPublicJWK()).toString().getBytes(StandardCharsets.UTF_8);
            JWKS_SERVER = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            JWKS_SERVER.createContext("/jwks", exchange -> {
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, jwks.length);
                try (OutputStream body = exchange.getResponseBody()) {
                    body.write(jwks);
                }
            });
            JWKS_SERVER.start();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    @DynamicPropertySource
    static void jwkSetUri(DynamicPropertyRegistry registry) {
        registry.add("clothic.auth.jwk-set-uri",
                () -> "http://127.0.0.1:" + JWKS_SERVER.getAddress().getPort() + "/jwks");
    }

    @AfterAll
    static void stopJwks() {
        JWKS_SERVER.stop(0);
    }

    @LocalServerPort
    private int port;

    @Test
    void tokenSignedByPublishedKeyIsAccepted() throws Exception {
        String token = TestTokens.sign(new ECDSASigner(SIGNING_KEY), JWSAlgorithm.ES256, SIGNING_KEY.getKeyID(),
                TestTokens.supabaseClaims().build());

        var response = TestTokens.get(port, "/api/me", token);
        assertEquals(200, response.statusCode());
        assertEquals("{\"userId\":\"" + TestTokens.USER_ID + "\"}", response.body());
    }

    @Test
    void tokenSignedByUnknownKeyIsRejected() throws Exception {
        String token = TestTokens.sign(new ECDSASigner(OTHER_KEY), JWSAlgorithm.ES256, OTHER_KEY.getKeyID(),
                TestTokens.supabaseClaims().build());

        assertEquals(401, TestTokens.get(port, "/api/me", token).statusCode());
    }

    @Test
    void missingTokenIsRejected() throws Exception {
        assertEquals(401, TestTokens.get(port, "/api/me", null).statusCode());
    }
}
