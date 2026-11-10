package com.clothic.backend.profile;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 기존 Supabase public.profiles 행 매핑. 행 생성은 가입 트리거(handle_new_user)가 담당하므로 서버는 만들지 않는다.
 */
@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "username")
    private String username;

    @Column(name = "daily_reminder_enabled", nullable = false)
    private boolean dailyReminderEnabled;

    @Column(name = "sleeping_wardrobe_enabled", nullable = false)
    private boolean sleepingWardrobeEnabled;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected Profile() {
    }

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public boolean isDailyReminderEnabled() {
        return dailyReminderEnabled;
    }

    public boolean isSleepingWardrobeEnabled() {
        return sleepingWardrobeEnabled;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    void setDailyReminderEnabled(boolean dailyReminderEnabled) {
        this.dailyReminderEnabled = dailyReminderEnabled;
    }

    void setSleepingWardrobeEnabled(boolean sleepingWardrobeEnabled) {
        this.sleepingWardrobeEnabled = sleepingWardrobeEnabled;
    }
}
