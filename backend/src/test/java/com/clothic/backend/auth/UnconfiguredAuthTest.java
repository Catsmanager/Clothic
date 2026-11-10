package com.clothic.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.crypto.MACSigner;

/** 검증 설정이 없으면 보호 경로는 어떤 토큰도 받지 않고 상태 확인만 응답한다(fail-closed). */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UnconfiguredAuthTest {

    @LocalServerPort
    private int port;

    @Test
    void protectedPathRejectsEveryTokenWhenVerificationIsNotConfigured() throws Exception {
        String token = TestTokens.sign(new MACSigner(HmacTokenVerificationTest.SECRET), JWSAlgorithm.HS256, null,
                TestTokens.supabaseClaims().build());

        assertEquals(401, TestTokens.get(port, "/api/me", token).statusCode());
        assertEquals(401, TestTokens.get(port, "/api/me", null).statusCode());
        assertEquals(200, TestTokens.get(port, "/api/health", null).statusCode());
    }
}
