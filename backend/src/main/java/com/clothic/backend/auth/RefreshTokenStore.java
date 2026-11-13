package com.clothic.backend.auth;

import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/** 갱신 토큰 저장소. 원문은 받지 않고 SHA-256 해시만 다룬다. 만료·폐기 시각은 DB 시계를 기준으로 한다. */
@Repository
class RefreshTokenStore {

    record Owner(UUID userId, UUID familyId) {
    }

    private final JdbcTemplate jdbc;

    RefreshTokenStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    void save(UUID userId, UUID familyId, String tokenHash, long ttlSeconds) {
        jdbc.update("""
                insert into public.refresh_tokens (user_id, family_id, token_hash, expires_at)
                values (?, ?, ?, now() + make_interval(secs => ?))
                """, userId, familyId, tokenHash, (double) ttlSeconds);
    }

    /**
     * 유효한 토큰을 폐기하고 같은 묶음의 새 토큰을 저장한다. 한 문장의 UPDATE로 폐기하므로 같은 토큰으로 동시에
     * 요청해도 한 요청만 성공한다. 유효하지 않으면 아무것도 바꾸지 않고 빈 값을 돌려준다.
     */
    @Transactional
    public Optional<Owner> rotate(String currentHash, String nextHash, long ttlSeconds) {
        Optional<Owner> owner = jdbc.query("""
                update public.refresh_tokens set revoked_at = now()
                where token_hash = ? and revoked_at is null and expires_at > now()
                returning user_id, family_id
                """, (row, index) -> new Owner(row.getObject("user_id", UUID.class),
                        row.getObject("family_id", UUID.class)),
                currentHash).stream().findFirst();
        owner.ifPresent(found -> save(found.userId(), found.familyId(), nextHash, ttlSeconds));
        return owner;
    }

    /**
     * 이미 폐기된 토큰이 다시 제시되면 탈취로 보고 같은 묶음의 남은 토큰을 모두 폐기한다.
     * 폐기 직후(graceSeconds 이내)의 재제시는 같은 기기의 동시 갱신일 수 있어 묶음을 건드리지 않는다.
     */
    int revokeFamilyIfReused(String tokenHash, long graceSeconds) {
        return jdbc.update("""
                update public.refresh_tokens set revoked_at = now()
                where revoked_at is null and family_id in (
                  select family_id from public.refresh_tokens
                  where token_hash = ? and revoked_at is not null
                    and revoked_at < now() - make_interval(secs => ?))
                """, tokenHash, (double) graceSeconds);
    }

    void revoke(String tokenHash) {
        jdbc.update("update public.refresh_tokens set revoked_at = now() where token_hash = ? and revoked_at is null",
                tokenHash);
    }
}
