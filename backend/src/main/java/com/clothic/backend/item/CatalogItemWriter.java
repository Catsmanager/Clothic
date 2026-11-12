package com.clothic.backend.item;

import java.sql.Array;
import java.util.Objects;
import java.util.UUID;

import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** 부분 고유 인덱스로 같은 사용자·기본 아이템의 동시 등록도 하나의 소유 행으로 유지한다. */
@Repository
public class CatalogItemWriter {

    private final JdbcTemplate jdbc;

    public CatalogItemWriter(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    int insertIfAbsent(UUID userId, ItemTemplateCatalog.Template template) {
        return Objects.requireNonNull(jdbc.execute((ConnectionCallback<Integer>) connection -> {
            try (var statement = connection.prepareStatement("""
                    insert into public.items (user_id, catalog_item_id, name, category, image_path, color, style_tags)
                    values (?, ?, ?, ?, ?, ?, ?)
                    on conflict (user_id, catalog_item_id) where catalog_item_id is not null do nothing
                    """)) {
                Array tags = connection.createArrayOf("text", template.styleTags().toArray(String[]::new));
                try {
                    statement.setObject(1, userId);
                    statement.setString(2, template.id());
                    statement.setString(3, template.name());
                    statement.setString(4, template.category());
                    statement.setString(5, template.imagePath());
                    statement.setString(6, template.color());
                    statement.setArray(7, tags);
                    return statement.executeUpdate();
                } finally {
                    tags.free();
                }
            }
        }));
    }
}
