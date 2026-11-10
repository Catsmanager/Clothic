package com.clothic.backend.item;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 기존 Supabase public.items 행을 읽기 위한 매핑. 테이블 생성·변경은 하지 않는다.
 */
@Entity
@Table(name = "items")
public class Item {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "catalog_item_id")
    private String catalogItemId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @Column(name = "color", nullable = false)
    private String color;

    @Column(name = "style_tags", nullable = false, columnDefinition = "text[]")
    private String[] styleTags;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected Item() {
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getCatalogItemId() {
        return catalogItemId;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public String getImagePath() {
        return imagePath;
    }

    public String getColor() {
        return color;
    }

    public String[] getStyleTags() {
        return styleTags == null ? new String[0] : styleTags.clone();
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
