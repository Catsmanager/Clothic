package com.clothic.backend.auth;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * 서버가 직접 계정을 관리하고 토큰을 발급할 때의 설정(S-02). signingSecret이 있으면 자체 인증이 켜진다.
 * Supabase 토큰 검증 설정(jwk-set-uri, hmac-secret)과 함께 쓸 수 없다.
 */
@ConfigurationProperties(prefix = "clothic.auth.local")
public record LocalAuthProperties(
        String signingSecret,
        @DefaultValue("clothic") String issuer,
        @DefaultValue("15m") Duration accessTokenTtl,
        @DefaultValue("30d") Duration refreshTokenTtl) {

    /** HS256 서명 키의 최소 길이(256비트). */
    static final int MIN_SECRET_BYTES = 32;

    public boolean enabled() {
        return signingSecret != null && !signingSecret.isBlank();
    }

    byte[] secretBytes() {
        if (!enabled()) {
            throw new IllegalStateException("clothic.auth.local.signing-secret is not set");
        }
        byte[] bytes = signingSecret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "clothic.auth.local.signing-secret must be at least " + MIN_SECRET_BYTES + " bytes");
        }
        return bytes;
    }
}
