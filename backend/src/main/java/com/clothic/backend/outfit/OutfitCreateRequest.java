package com.clothic.backend.outfit;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** 신규 저장만 검사한다. 과거 기록의 조회 계약은 좁히지 않는다. */
public record OutfitCreateRequest(UUID requestId, LocalDate date, String mood, String weather,
        String memo, List<String> itemIds, Map<String, String> itemColors) {
    private static final Set<String> FIELDS = Set.of("requestId", "date", "mood", "weather", "memo", "itemIds", "itemColors");
    private static final Set<String> MOODS = Set.of("happy", "confident", "cozy", "tired", "excited", "calm");
    private static final Set<String> WEATHER = Set.of("sunny", "cloudy", "rainy", "snowy", "hot", "cold", "windy");

    public static OutfitCreateRequest fromJson(Map<String, Object> body) {
        if (body == null || !body.keySet().equals(FIELDS)) throw invalid();
        UUID requestId;
        LocalDate date;
        try {
            if (!(body.get("requestId") instanceof String id) || !(body.get("date") instanceof String day)
                    || !day.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}")) throw invalid();
            requestId = UUID.fromString(id);
            if (!requestId.toString().equalsIgnoreCase(id)) throw invalid();
            date = LocalDate.parse(day);
            if (date.getYear() < 1) throw invalid();
        } catch (IllegalArgumentException | DateTimeParseException error) {
            throw invalid();
        }
        String mood = nullableText(body.get("mood"));
        String weather = nullableText(body.get("weather"));
        String memo = nullableText(body.get("memo"));
        if (mood != null && !MOODS.contains(mood) || weather != null && !WEATHER.contains(weather)
                || memo != null && (memo.length() > 100 || memo.indexOf(0) >= 0)) throw invalid();
        if (memo != null) memo = memo.trim().isEmpty() ? null : memo.trim();
        if (!(body.get("itemIds") instanceof List<?> rawIds) || rawIds.isEmpty() || rawIds.size() > 100) throw invalid();
        List<String> ids = new ArrayList<>();
        for (Object value : rawIds) {
            String id = itemId(value);
            if (ids.contains(id)) throw invalid();
            ids.add(id);
        }
        if (!(body.get("itemColors") instanceof Map<?, ?> rawColors)) throw invalid();
        Map<String, String> colors = new LinkedHashMap<>();
        for (var entry : rawColors.entrySet()) {
            String key = itemId(entry.getKey());
            if (!ids.contains(key) || !(entry.getValue() instanceof String color)
                    || !color.matches("#[0-9a-fA-F]{6}") || colors.putIfAbsent(key, color) != null) throw invalid();
        }
        return new OutfitCreateRequest(requestId, date, mood, weather, memo, List.copyOf(ids), Map.copyOf(colors));
    }

    private static String nullableText(Object value) {
        if (value == null) return null;
        if (value instanceof String text) return text;
        throw invalid();
    }

    private static String itemId(Object value) {
        if (!(value instanceof String id) || id.isBlank() || id.length() > 120 || !id.equals(id.trim())) throw invalid();
        try {
            UUID uuid = UUID.fromString(id);
            if (uuid.toString().equalsIgnoreCase(id)) return uuid.toString();
        } catch (IllegalArgumentException ignored) {
            // UUID가 아니면 다음 계층에서 서버 카탈로그 ID인지 확인한다.
        }
        return id;
    }

    private static ResponseStatusException invalid() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid outfit input");
    }

    boolean matches(OutfitResponse row) {
        return date.equals(row.date()) && java.util.Objects.equals(mood, row.mood())
                && java.util.Objects.equals(weather, row.weather()) && java.util.Objects.equals(memo, row.memo())
                && itemIds.equals(row.itemIds()) && itemColors.equals(row.itemColors());
    }
}
