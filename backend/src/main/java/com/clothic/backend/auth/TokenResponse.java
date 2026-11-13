package com.clothic.backend.auth;

import java.util.UUID;

/** 가입·로그인·갱신 응답. expiresIn은 접근 토큰의 남은 수명(초)이다. 비밀번호는 어떤 응답에도 넣지 않는다. */
public record TokenResponse(UUID userId, String email, String accessToken, long expiresIn, String refreshToken) {
}
