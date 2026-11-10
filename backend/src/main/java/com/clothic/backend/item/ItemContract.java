package com.clothic.backend.item;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * 앱 frontend/constants/items.ts 의 허용 카테고리·스타일 태그와 stores/itemStore.ts 의 mapRow() 규칙을 서버에서 재현한다.
 * 허용하지 않은 카테고리 행은 응답에서 제외하고, 허용하지 않은 스타일 태그 값은 제거한다.
 */
public final class ItemContract {

    static final Set<String> CATEGORIES = Set.of("top", "outer", "bottom", "dress", "shoes", "hair", "accessory");

    static final Set<String> STYLE_TAGS = Set.of(
            "casual", "formal", "street", "feminine", "minimal", "sporty", "vintage", "chic", "bohemian", "preppy");

    private ItemContract() {
    }

    static Optional<ItemResponse> toResponse(Item item) {
        if (item.getCategory() == null || !CATEGORIES.contains(item.getCategory())) {
            return Optional.empty();
        }
        List<String> styleTags = Arrays.stream(item.getStyleTags())
                .filter(STYLE_TAGS::contains)
                .toList();
        return Optional.of(new ItemResponse(
                item.getId().toString(),
                item.getUserId().toString(),
                item.getCatalogItemId(),
                item.getName(),
                item.getCategory(),
                item.getImagePath(),
                item.getColor(),
                styleTags,
                item.getCreatedAt()));
    }
}
