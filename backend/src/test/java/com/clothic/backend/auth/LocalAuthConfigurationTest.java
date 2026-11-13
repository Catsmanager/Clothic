package com.clothic.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

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

/** 자체 인증을 켜지 않은 기존 설정(Supabase 토큰 검증)에서는 가입·로그인 경로가 열리지 않고, 잘못된 설정 조합은 기동하지 않는다. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "clothic.auth.issuer=" + TestTokens.ISSUER,
        "clothic.auth.hmac-secret=" + HmacTokenVerificationTest.SECRET,
})
class LocalAuthConfigurationTest {

    private static final String LONG_SECRET = "local-auth-config-test-secret-with-at-least-32-bytes-0123456789";
    private static final Duration TTL = Duration.ofMinutes(15);

    @LocalServerPort
    private int port;

    private int postLogin(String bearerToken) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/auth/login"))
                .timeout(Duration.ofSeconds(10)).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{\"email\":\"a@test.local\",\"password\":\"secret1\"}"));
        if (bearerToken != null) {
            request.header("Authorization", "Bearer " + bearerToken);
        }
        try (HttpClient client = HttpClient.newHttpClient()) {
            return client.send(request.build(), HttpResponse.BodyHandlers.ofString()).statusCode();
        }
    }

    @Test
    void authPathsStayClosedWhenLocalAuthIsNotEnabled() throws Exception {
        String supabaseToken = TestTokens.sign(new MACSigner(HmacTokenVerificationTest.SECRET), JWSAlgorithm.HS256,
                null, TestTokens.supabaseClaims().build());

        assertEquals(401, postLogin(null), "토큰 없이 접근할 수 있는 경로가 아니다");
        assertEquals(404, postLogin(supabaseToken), "인증된 요청에도 기능이 없는 것으로 응답한다");
    }

    @Test
    void localSigningCannotBeCombinedWithSupabaseVerification() {
        LocalAuthProperties local = new LocalAuthProperties(LONG_SECRET, "clothic", TTL, TTL);
        AuthProperties hmac = new AuthProperties(TestTokens.ISSUER, "authenticated", null, HmacTokenVerificationTest.SECRET);
        AuthProperties jwks = new AuthProperties(TestTokens.ISSUER, "authenticated", "https://example.test/jwks", null);

        assertThrows(IllegalStateException.class, () -> SupabaseJwtDecoderFactory.create(hmac, local));
        assertThrows(IllegalStateException.class, () -> SupabaseJwtDecoderFactory.create(jwks, local));
    }

    @Test
    void shortSigningSecretOrBlankIssuerIsRejectedAtStartup() {
        AuthProperties none = new AuthProperties(null, "authenticated", null, null);

        assertThrows(IllegalStateException.class, () -> SupabaseJwtDecoderFactory.create(none,
                new LocalAuthProperties("too-short-secret", "clothic", TTL, TTL)));
        assertThrows(IllegalStateException.class, () -> SupabaseJwtDecoderFactory.create(none,
                new LocalAuthProperties(LONG_SECRET, " ", TTL, TTL)));
    }
}
