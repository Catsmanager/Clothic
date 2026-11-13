package com.clothic.backend.auth;

import java.util.Map;
import java.util.function.Function;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * POST /api/auth/signup·login·refresh·logout (S-02). 자체 인증 설정이 꺼져 있으면 존재하지 않는 경로로 응답한다.
 * 로그인 실패는 없는 이메일과 틀린 비밀번호를 구분하지 않는다.
 */
@RestController
@RequestMapping(value = "/api/auth", consumes = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping(value = "/signup", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TokenResponse> signup(@RequestBody Map<String, Object> body) {
        AuthRequests.Credentials credentials = parse(body, AuthRequests::signup);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.signup(credentials));
        } catch (AuthService.EmailTakenException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "an account with this email already exists");
        }
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public TokenResponse login(@RequestBody Map<String, Object> body) {
        AuthRequests.Credentials credentials = parse(body, AuthRequests::login);
        try {
            return service.login(credentials);
        } catch (AuthService.InvalidCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "email or password is incorrect");
        }
    }

    @PostMapping(value = "/refresh", produces = MediaType.APPLICATION_JSON_VALUE)
    public TokenResponse refresh(@RequestBody Map<String, Object> body) {
        String refreshToken = parse(body, AuthRequests::refreshToken);
        try {
            return service.refresh(refreshToken);
        } catch (AuthService.InvalidCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "refresh token is not valid");
        }
    }

    /** 토큰이 유효했는지와 관계없이 204다. 이미 발급된 접근 토큰은 만료 시각까지 유효하다. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody Map<String, Object> body) {
        service.logout(parse(body, AuthRequests::refreshToken));
        return ResponseEntity.noContent().build();
    }

    private <T> T parse(Map<String, Object> body, Function<Map<String, Object>, T> parser) {
        if (!service.enabled()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        try {
            return parser.apply(body);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
