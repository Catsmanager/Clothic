package com.clothic.backend.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 이메일 계정의 가입·로그인과 토큰 발급·갱신·폐기(S-02). 자체 인증 설정이 켜져 있을 때만 동작한다.
 * 비밀번호는 BCrypt 해시로만, 갱신 토큰은 SHA-256 해시로만 저장한다.
 */
@Service
public class AuthService {

    /** 폐기 직후 같은 토큰이 다시 오는 것은 같은 기기의 동시 갱신으로 본다. 그보다 늦으면 탈취로 본다. */
    static final long REUSE_GRACE_SECONDS = 10;

    static final class EmailTakenException extends RuntimeException {
    }

    static final class InvalidCredentialsException extends RuntimeException {
    }

    private final LocalAuthProperties properties;
    private final AccountStore accounts;
    private final RefreshTokenStore refreshTokens;
    private final AccessTokenIssuer accessTokens;
    private final PasswordEncoder passwords = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();
    /** 없는 이메일로 로그인해도 해시 비교를 한 번 수행해, 응답 시간으로 가입 여부가 드러나지 않게 한다. */
    private final String placeholderHash = passwords.encode(UUID.randomUUID().toString());

    AuthService(LocalAuthProperties properties, AccountStore accounts, RefreshTokenStore refreshTokens,
            AccessTokenIssuer accessTokens) {
        this.properties = properties;
        this.accounts = accounts;
        this.refreshTokens = refreshTokens;
        this.accessTokens = accessTokens;
    }

    public boolean enabled() {
        return properties.enabled();
    }

    @Transactional
    public TokenResponse signup(AuthRequests.Credentials credentials) {
        UUID userId;
        try {
            userId = accounts.create(credentials.email(), passwords.encode(credentials.password()));
        } catch (DuplicateKeyException e) {
            throw new EmailTakenException();
        }
        return issue(userId, credentials.email(), UUID.randomUUID());
    }

    public TokenResponse login(AuthRequests.Credentials credentials) {
        Optional<AccountStore.Account> account = accounts.findByEmail(credentials.email());
        String storedHash = account.map(AccountStore.Account::passwordHash).orElse(null);
        boolean comparable = storedHash != null && !AuthRequests.passwordTooLong(credentials.password());
        boolean matches = passwords.matches(
                comparable ? credentials.password() : "", comparable ? storedHash : placeholderHash);
        if (!comparable || !matches) {
            throw new InvalidCredentialsException();
        }
        return issue(account.get().id(), account.get().email(), UUID.randomUUID());
    }

    public TokenResponse refresh(String refreshToken) {
        String currentHash = sha256(refreshToken);
        String next = newRefreshToken();
        Optional<RefreshTokenStore.Owner> owner = refreshTokens.rotate(
                currentHash, sha256(next), properties.refreshTokenTtl().toSeconds());
        if (owner.isEmpty()) {
            refreshTokens.revokeFamilyIfReused(currentHash, REUSE_GRACE_SECONDS);
            throw new InvalidCredentialsException();
        }
        UUID userId = owner.get().userId();
        return new TokenResponse(userId, accounts.findEmail(userId).orElse(null),
                accessTokens.issue(userId), accessTokens.expiresInSeconds(), next);
    }

    public void logout(String refreshToken) {
        refreshTokens.revoke(sha256(refreshToken));
    }

    private TokenResponse issue(UUID userId, String email, UUID familyId) {
        String refreshToken = newRefreshToken();
        refreshTokens.save(userId, familyId, sha256(refreshToken), properties.refreshTokenTtl().toSeconds());
        return new TokenResponse(userId, email, accessTokens.issue(userId), accessTokens.expiresInSeconds(),
                refreshToken);
    }

    private String newRefreshToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
