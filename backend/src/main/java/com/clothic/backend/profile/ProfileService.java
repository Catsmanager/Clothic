package com.clothic.backend.profile;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 조회·변경 모두 인증된 사용자 ID의 행에만 닿는다. */
@Service
public class ProfileService {

    private final ProfileRepository repository;

    public ProfileService(ProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Optional<Profile> findOwnProfile(UUID authenticatedUserId) {
        Objects.requireNonNull(authenticatedUserId, "authenticatedUserId");
        return repository.findById(authenticatedUserId);
    }

    @Transactional
    public Optional<Profile> updateOwnProfile(UUID authenticatedUserId, ProfileUpdateRequest request) {
        Objects.requireNonNull(authenticatedUserId, "authenticatedUserId");
        return repository.findById(authenticatedUserId).map(profile -> {
            if (request.dailyReminderEnabled() != null) {
                profile.setDailyReminderEnabled(request.dailyReminderEnabled());
            }
            if (request.sleepingWardrobeEnabled() != null) {
                profile.setSleepingWardrobeEnabled(request.sleepingWardrobeEnabled());
            }
            return repository.save(profile);
        });
    }
}
