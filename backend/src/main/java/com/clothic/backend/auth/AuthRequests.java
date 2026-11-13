package com.clothic.backend.auth;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * 인증 요청 본문 검사. JSON 라이브러리의 기본 동작에 기대지 않고 허용한 키와 형식만 받는다.
 * 오류 메시지에는 입력값(특히 비밀번호)을 넣지 않는다.
 */
final class AuthRequests {

    /** 앱 화면의 최소 길이와 같다(frontend/app/signup.tsx). 길이는 앱과 같이 UTF-16 단위로 센다. */
    static final int MIN_PASSWORD_LENGTH = 6;
    /** BCrypt는 72바이트까지만 사용한다. 더 긴 값을 조용히 잘라 쓰지 않도록 거부한다. */
    static final int MAX_PASSWORD_BYTES = 72;
    static final int MAX_EMAIL_LENGTH = 254;
    static final int MAX_REFRESH_TOKEN_LENGTH = 200;

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    record Credentials(String email, String password) {
    }

    private AuthRequests() {
    }

    /** 가입: 이메일 형식과 비밀번호 규칙을 모두 검사한다. */
    static Credentials signup(Map<String, Object> body) {
        Credentials credentials = credentials(body);
        if (!EMAIL.matcher(credentials.email()).matches() || credentials.email().length() > MAX_EMAIL_LENGTH) {
            throw new IllegalArgumentException("email is not valid");
        }
        if (credentials.password().length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalArgumentException("password must be at least " + MIN_PASSWORD_LENGTH + " characters");
        }
        if (passwordTooLong(credentials.password())) {
            throw new IllegalArgumentException("password must be at most " + MAX_PASSWORD_BYTES + " bytes");
        }
        return credentials;
    }

    /** 로그인: 형태만 검사한다. 규칙에 맞지 않는 값은 불일치(401)로 처리해 가입 규칙을 드러내지 않는다. */
    static Credentials login(Map<String, Object> body) {
        return credentials(body);
    }

    static String refreshToken(Map<String, Object> body) {
        requireKeys(body, Set.of("refreshToken"));
        String token = string(body, "refreshToken");
        if (token.isBlank() || token.length() > MAX_REFRESH_TOKEN_LENGTH) {
            throw new IllegalArgumentException("refreshToken is not valid");
        }
        return token;
    }

    static boolean passwordTooLong(String password) {
        return password.getBytes(StandardCharsets.UTF_8).length > MAX_PASSWORD_BYTES;
    }

    static String normalizeEmail(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }

    private static Credentials credentials(Map<String, Object> body) {
        requireKeys(body, Set.of("email", "password"));
        String email = normalizeEmail(string(body, "email"));
        String password = string(body, "password");
        if (email.isEmpty() || password.isEmpty()) {
            throw new IllegalArgumentException("email and password are required");
        }
        return new Credentials(email, password);
    }

    private static void requireKeys(Map<String, Object> body, Set<String> keys) {
        if (body == null || !body.keySet().equals(keys)) {
            throw new IllegalArgumentException("body must contain exactly: " + String.join(", ", keys.stream().sorted().toList()));
        }
    }

    private static String string(Map<String, Object> body, String key) {
        if (body.get(key) instanceof String value) {
            return value;
        }
        throw new IllegalArgumentException("field must be a string: " + key);
    }
}
