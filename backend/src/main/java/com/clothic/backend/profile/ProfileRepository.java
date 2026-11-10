package com.clothic.backend.profile;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.Repository;

/** 본인 ID로만 접근하는 저장소. 목록·삭제·생성 메서드는 노출하지 않는다. */
public interface ProfileRepository extends Repository<Profile, UUID> {

    Optional<Profile> findById(UUID id);

    Profile save(Profile profile);
}
