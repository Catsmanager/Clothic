package com.clothic.backend.auth;

import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** 서버 소유 스키마의 users 테이블. 이메일은 호출 전에 정규화된 값이어야 한다. */
@Repository
class AccountStore {

    record Account(UUID id, String email, String passwordHash) {
    }

    private final JdbcTemplate jdbc;

    AccountStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** 계정을 만든다. 같은 이메일이 이미 있으면 DuplicateKeyException이 난다. 프로필 행은 DB 트리거가 만든다. */
    UUID create(String email, String passwordHash) {
        return jdbc.queryForObject(
                "insert into public.users (email, password_hash) values (?, ?) returning id",
                UUID.class, email, passwordHash);
    }

    Optional<Account> findByEmail(String email) {
        return jdbc.query("select id, email, password_hash from public.users where email = ?",
                (row, index) -> new Account(row.getObject("id", UUID.class), row.getString("email"),
                        row.getString("password_hash")),
                email).stream().findFirst();
    }

    Optional<String> findEmail(UUID id) {
        return jdbc.query("select email from public.users where id = ?",
                (row, index) -> Optional.ofNullable(row.getString("email")), id)
                .stream().findFirst().flatMap(email -> email);
    }
}
