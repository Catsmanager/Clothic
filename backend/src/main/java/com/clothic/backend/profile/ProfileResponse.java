package com.clothic.backend.profile;

import java.time.OffsetDateTime;

public record ProfileResponse(
        String id,
        String username,
        boolean dailyReminderEnabled,
        boolean sleepingWardrobeEnabled,
        OffsetDateTime createdAt) {

    static ProfileResponse from(Profile profile) {
        return new ProfileResponse(
                profile.getId().toString(),
                profile.getUsername(),
                profile.isDailyReminderEnabled(),
                profile.isSleepingWardrobeEnabled(),
                profile.getCreatedAt());
    }
}
