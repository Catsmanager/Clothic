package com.clothic.backend.profile;

import java.util.Map;
import java.util.Set;

/**
 * 앱이 실제로 바꾸는 두 설정만 받는다. id·createdAt·username 등 다른 키가 오면 요청 전체를 거부한다.
 * JSON 라이브러리의 미지 필드 처리 기본값에 의존하지 않고 키를 직접 검사한다.
 */
public record ProfileUpdateRequest(Boolean dailyReminderEnabled, Boolean sleepingWardrobeEnabled) {

    private static final Set<String> ALLOWED_KEYS = Set.of("dailyReminderEnabled", "sleepingWardrobeEnabled");

    static ProfileUpdateRequest fromJson(Map<String, Object> body) {
        if (body == null || body.isEmpty()) {
            throw new IllegalArgumentException("no updatable profile field was provided");
        }
        for (String key : body.keySet()) {
            if (!ALLOWED_KEYS.contains(key)) {
                throw new IllegalArgumentException("field is not updatable: " + key);
            }
        }
        return new ProfileUpdateRequest(
                booleanField(body, "dailyReminderEnabled"),
                booleanField(body, "sleepingWardrobeEnabled"));
    }

    private static Boolean booleanField(Map<String, Object> body, String key) {
        if (!body.containsKey(key)) {
            return null;
        }
        Object value = body.get(key);
        if (value instanceof Boolean bool) {
            return bool;
        }
        throw new IllegalArgumentException("field must be a boolean: " + key);
    }
}
