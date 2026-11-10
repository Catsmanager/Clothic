package com.clothic.backend.item;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * 앱의 UserItem과 같은 필드 이름·순서. 엔티티를 직접 반환하지 않는다.
 */
public record ItemResponse(
        String id,
        String userId,
        String catalogItemId,
        String name,
        String category,
        String imagePath,
        String color,
        List<String> styleTags,
        OffsetDateTime createdAt) {
}
