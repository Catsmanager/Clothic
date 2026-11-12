package com.clothic.backend.outfit;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** 앱 Outfit 계약. 과거 카탈로그 ID와 현재 소유 UUID를 변환하거나 제거하지 않는다. */
public record OutfitResponse(UUID id, UUID userId, LocalDate date, String mood, String weather,
        String memo, List<String> itemIds, Map<String, String> itemColors, boolean isFavorite,
        OffsetDateTime createdAt) {
}
