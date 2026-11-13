package com.clothic.backend.auth;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

/** 서버가 서명하는 접근 토큰(JWT, HS256). 보호 경로는 이 토큰의 sub로 사용자를 식별한다. */
@Component
class AccessTokenIssuer {

    private final AuthProperties auth;
    private final LocalAuthProperties local;

    AccessTokenIssuer(AuthProperties auth, LocalAuthProperties local) {
        this.auth = auth;
        this.local = local;
    }

    String issue(UUID userId) {
        Instant now = Instant.now();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(local.issuer())
                .audience(SupabaseJwtDecoderFactory.audience(auth))
                .subject(userId.toString())
                .jwtID(UUID.randomUUID().toString())
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plus(local.accessTokenTtl())))
                .build();
        SignedJWT jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.HS256).type(JOSEObjectType.JWT).build(), claims);
        try {
            jwt.sign(new MACSigner(local.secretBytes()));
        } catch (JOSEException e) {
            throw new IllegalStateException("failed to sign an access token", e);
        }
        return jwt.serialize();
    }

    long expiresInSeconds() {
        return local.accessTokenTtl().toSeconds();
    }
}
