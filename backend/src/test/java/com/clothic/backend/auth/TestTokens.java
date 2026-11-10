package com.clothic.backend.auth;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

/** 테스트 전용 토큰 생성·요청 도우미. 실제 Supabase 비밀키나 토큰은 사용하지 않는다. */
public final class TestTokens {

    public static final String ISSUER = "https://test-project.supabase.co/auth/v1";
    public static final String AUDIENCE = "authenticated";
    public static final String USER_ID = UUID.randomUUID().toString();

    private TestTokens() {
    }

    public static JWTClaimsSet.Builder supabaseClaims() {
        Instant now = Instant.now();
        return new JWTClaimsSet.Builder()
                .issuer(ISSUER)
                .audience(AUDIENCE)
                .subject(USER_ID)
                .claim("role", "authenticated")
                .issueTime(Date.from(now.minusSeconds(5)))
                .expirationTime(Date.from(now.plusSeconds(600)));
    }

    public static String sign(JWSSigner signer, JWSAlgorithm algorithm, String keyId, JWTClaimsSet claims)
            throws JOSEException {
        JWSHeader.Builder header = new JWSHeader.Builder(algorithm).type(com.nimbusds.jose.JOSEObjectType.JWT);
        if (keyId != null) {
            header.keyID(keyId);
        }
        SignedJWT jwt = new SignedJWT(header.build(), claims);
        jwt.sign(signer);
        return jwt.serialize();
    }

    public static HttpResponse<String> get(int port, String path, String bearerToken) throws Exception {
        try (HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()) {
            HttpRequest.Builder request = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:" + port + path))
                    .timeout(Duration.ofSeconds(5))
                    .GET();
            if (bearerToken != null) {
                request.header("Authorization", "Bearer " + bearerToken);
            }
            return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
        }
    }

    public static List<String> wwwAuthenticate(HttpResponse<String> response) {
        return response.headers().allValues("www-authenticate");
    }
}
