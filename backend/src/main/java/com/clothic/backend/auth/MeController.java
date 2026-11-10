package com.clothic.backend.auth;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 검증된 토큰의 사용자 식별값만 돌려준다. 후속 조회 기능은 이 값으로 본인 데이터를 제한한다.
 */
@RestController
public class MeController {

    @GetMapping(value = "/api/me", produces = MediaType.APPLICATION_JSON_VALUE)
    public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
        return new MeResponse(jwt.getSubject());
    }

    public record MeResponse(String userId) {
    }
}
