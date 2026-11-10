package com.clothic.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.Date;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.crypto.MACSigner;

/** 레거시 대칭 서명(HS256) 설정에서 토큰 검증 규칙을 확인한다. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "clothic.auth.issuer=" + TestTokens.ISSUER,
        "clothic.auth.hmac-secret=" + HmacTokenVerificationTest.SECRET,
})
class HmacTokenVerificationTest {

    static final String SECRET = "test-only-hmac-secret-with-at-least-32-bytes-0123456789";
    private static final String OTHER_SECRET = "another-test-only-secret-with-at-least-32-bytes-9876543210";

    @LocalServerPort
    private int port;

    private String token(com.nimbusds.jwt.JWTClaimsSet claims) throws Exception {
        return TestTokens.sign(new MACSigner(SECRET), JWSAlgorithm.HS256, null, claims);
    }

    @Test
    void validTokenReturnsVerifiedUserId() throws Exception {
        HttpResponse<String> response = TestTokens.get(port, "/api/me", token(TestTokens.supabaseClaims().build()));

        assertEquals(200, response.statusCode());
        assertEquals("{\"userId\":\"" + TestTokens.USER_ID + "\"}", response.body());
    }

    @Test
    void healthStaysPublic() throws Exception {
        HttpResponse<String> response = TestTokens.get(port, "/api/health", null);

        assertEquals(200, response.statusCode());
        assertEquals("{\"status\":\"ok\"}", response.body());
    }

    @Test
    void missingTokenIsRejected() throws Exception {
        HttpResponse<String> response = TestTokens.get(port, "/api/me", null);

        assertEquals(401, response.statusCode());
        assertTrue(TestTokens.wwwAuthenticate(response).stream().anyMatch(v -> v.startsWith("Bearer")));
        assertFalse(response.body().contains(TestTokens.USER_ID));
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() throws Exception {
        String forged = TestTokens.sign(new MACSigner(OTHER_SECRET), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().build());

        assertEquals(401, TestTokens.get(port, "/api/me", forged).statusCode());
    }

    @Test
    void tamperedPayloadIsRejected() throws Exception {
        String valid = token(TestTokens.supabaseClaims().build());
        String[] parts = valid.split("\\.");
        String tamperedPayload = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(
                ("{\"iss\":\"" + TestTokens.ISSUER + "\",\"aud\":\"authenticated\",\"sub\":\"attacker\",\"exp\":"
                        + (Instant.now().getEpochSecond() + 600) + "}").getBytes());
        String tampered = parts[0] + "." + tamperedPayload + "." + parts[2];

        HttpResponse<String> response = TestTokens.get(port, "/api/me", tampered);
        assertEquals(401, response.statusCode());
        assertFalse(response.body().contains("attacker"));
    }

    @Test
    void expiredTokenIsRejected() throws Exception {
        String expired = token(TestTokens.supabaseClaims()
                .expirationTime(Date.from(Instant.now().minusSeconds(3600)))
                .build());

        assertEquals(401, TestTokens.get(port, "/api/me", expired).statusCode());
    }

    @Test
    void wrongIssuerIsRejected() throws Exception {
        String other = token(TestTokens.supabaseClaims()
                .issuer("https://other-project.supabase.co/auth/v1")
                .build());

        assertEquals(401, TestTokens.get(port, "/api/me", other).statusCode());
    }

    @Test
    void wrongAudienceIsRejected() throws Exception {
        String anon = token(TestTokens.supabaseClaims().audience("anon").build());

        assertEquals(401, TestTokens.get(port, "/api/me", anon).statusCode());
    }

    @Test
    void tokenWithoutSubjectIsRejected() throws Exception {
        String noSubject = token(TestTokens.supabaseClaims().subject(null).build());

        assertEquals(401, TestTokens.get(port, "/api/me", noSubject).statusCode());
    }

    @Test
    void malformedTokenIsRejected() throws Exception {
        assertEquals(401, TestTokens.get(port, "/api/me", "not-a-jwt").statusCode());
    }
}
