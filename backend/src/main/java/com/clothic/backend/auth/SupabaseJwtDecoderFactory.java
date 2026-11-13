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
 * 설정에 따라 토큰 디코더를 만든다. 서명, 만료, 발급자, 대상, 사용자 식별값(sub)을 모두 검증한다.
 * Supabase가 발급한 토큰(jwk-set-uri 또는 hmac-secret) 또는 서버가 직접 발급한 토큰(local.signing-secret) 중
 * 한 가지만 받는다. 두 발급자를 동시에 신뢰하지 않는다.
 */
final class SupabaseJwtDecoderFactory {

    private SupabaseJwtDecoderFactory() {
    }

    static JwtDecoder create(AuthProperties properties, LocalAuthProperties local) {
        if (!local.enabled()) {
            return create(properties);
        }
        if (properties.hasJwkSetUri() || properties.hasHmacSecret()) {
            throw new IllegalStateException(
                    "clothic.auth.local.signing-secret must not be combined with Supabase token verification settings");
        }
        if (local.issuer() == null || local.issuer().isBlank()) {
            throw new IllegalStateException("clothic.auth.local.issuer must not be blank");
        }
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withSecretKey(new SecretKeySpec(local.secretBytes(), "HmacSHA256"))
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(validator(local.issuer(), audience(properties)));
        return decoder;
    }

    static String audience(AuthProperties properties) {
        return properties.audience() == null || properties.audience().isBlank()
                ? "authenticated"
                : properties.audience();
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
        decoder.setJwtValidator(validator(properties.issuer(), audience(properties)));
        return decoder;
    }

    private static OAuth2TokenValidator<Jwt> validator(String issuer, String audience) {
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
                JwtValidators.createDefaultWithIssuer(issuer),
                audienceValidator,
                subjectValidator);
    }
}
