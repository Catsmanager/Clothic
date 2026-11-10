package com.clothic.backend.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Supabase 토큰 검증 설정. 서명 방식은 jwkSetUri(비대칭) 또는 hmacSecret(레거시 대칭) 중 하나만 사용한다.
 */
@ConfigurationProperties(prefix = "clothic.auth")
public record AuthProperties(String issuer, String audience, String jwkSetUri, String hmacSecret) {

    public boolean hasJwkSetUri() {
        return jwkSetUri != null && !jwkSetUri.isBlank();
    }

    public boolean hasHmacSecret() {
        return hmacSecret != null && !hmacSecret.isBlank();
    }

    public boolean hasIssuer() {
        return issuer != null && !issuer.isBlank();
    }
}
