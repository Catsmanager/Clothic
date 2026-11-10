package com.clothic.backend.auth;

import java.nio.charset.StandardCharsets;
import java.util.List;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

/**
 * 설정에 따라 Supabase 토큰 디코더를 만든다. 서명, 만료, 발급자, 대상, 사용자 식별값(sub)을 모두 검증한다.
 */
final class SupabaseJwtDecoderFactory {

    private SupabaseJwtDecoderFactory() {
    }

    static JwtDecoder create(AuthProperties properties) {
        if (properties.hasJwkSetUri() && properties.hasHmacSecret()) {
            throw new IllegalStateException(
                    "clothic.auth.jwk-set-uri and clothic.auth.hmac-secret must not both be set");
        }
        if (!properties.hasJwkSetUri() && !properties.hasHmacSecret()) {
            return token -> {
                throw new BadJwtException("token verification is not configured");
            };
        }
        if (!properties.hasIssuer()) {
            throw new IllegalStateException("clothic.auth.issuer is required when token verification is configured");
        }

        NimbusJwtDecoder decoder;
        if (properties.hasJwkSetUri()) {
            decoder = NimbusJwtDecoder.withJwkSetUri(properties.jwkSetUri())
                    .jwsAlgorithms(algorithms -> {
                        algorithms.add(SignatureAlgorithm.ES256);
                        algorithms.add(SignatureAlgorithm.RS256);
                    })
                    .build();
        } else {
            SecretKeySpec key = new SecretKeySpec(
                    properties.hmacSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        }
        decoder.setJwtValidator(validator(properties));
        return decoder;
    }

    private static OAuth2TokenValidator<Jwt> validator(AuthProperties properties) {
        String audience = properties.audience() == null || properties.audience().isBlank()
                ? "authenticated"
                : properties.audience();
        OAuth2TokenValidator<Jwt> audienceValidator = new JwtClaimValidator<List<String>>(
                "aud", aud -> aud != null && aud.contains(audience));
        OAuth2TokenValidator<Jwt> subjectValidator = jwt -> {
            String subject = jwt.getSubject();
            if (subject == null || subject.isBlank()) {
                return OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token", "The token has no subject", null));
            }
            return OAuth2TokenValidatorResult.success();
        };
        return new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(properties.issuer()),
                audienceValidator,
                subjectValidator);
    }
}
