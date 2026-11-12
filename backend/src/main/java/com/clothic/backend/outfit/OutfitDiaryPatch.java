package com.clothic.backend.outfit;

import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** null(지우기)과 미제공(유지)을 구분한다. */
public record OutfitDiaryPatch(boolean hasMood, String mood, boolean hasMemo, String memo) {
    private static final Set<String> FIELDS = Set.of("mood", "memo");
    private static final Set<String> MOODS = Set.of("happy", "confident", "cozy", "tired", "excited", "calm");

    public static OutfitDiaryPatch fromJson(Map<String, Object> body) {
        if (body == null || body.isEmpty() || !FIELDS.containsAll(body.keySet())) throw invalid();
        String mood = text(body.get("mood"));
        String memo = text(body.get("memo"));
        if (mood != null && !MOODS.contains(mood)
                || memo != null && (memo.length() > 100 || memo.indexOf(0) >= 0)) throw invalid();
        if (memo != null) memo = memo.trim().isEmpty() ? null : memo.trim();
        return new OutfitDiaryPatch(body.containsKey("mood"), mood, body.containsKey("memo"), memo);
    }

    private static String text(Object value) {
        if (value == null) return null;
        if (value instanceof String text) return text;
        throw invalid();
    }

    private static ResponseStatusException invalid() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "only valid mood and memo changes are accepted");
    }
}
