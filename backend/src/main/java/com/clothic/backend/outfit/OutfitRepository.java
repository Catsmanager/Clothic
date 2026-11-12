package com.clothic.backend.outfit;

import java.sql.Array;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import tools.jackson.databind.ObjectMapper;

@Repository
public class OutfitRepository {

    private final JdbcTemplate jdbc;
    private final ObjectMapper json;

    public OutfitRepository(JdbcTemplate jdbc, ObjectMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    public List<OutfitResponse> findOwned(UUID userId) {
        return jdbc.query("""
                select id, user_id, date, mood, weather, memo, item_ids, item_colors, is_favorite, created_at
                from public.outfits where user_id = ? order by date desc, created_at desc, id asc
                """, (row, index) -> map(row), userId);
    }

    public Optional<OutfitResponse> findOwnedById(UUID userId, UUID outfitId) {
        return jdbc.query("""
                select id, user_id, date, mood, weather, memo, item_ids, item_colors, is_favorite, created_at
                from public.outfits where user_id = ? and id = ?
                """, (row, index) -> map(row), userId, outfitId).stream().findFirst();
    }

    private OutfitResponse map(ResultSet row) throws SQLException {
        Array sqlIds = row.getArray("item_ids");
        List<String> ids;
        try {
            ids = sqlIds == null ? List.of() : List.copyOf(Arrays.asList((String[]) sqlIds.getArray()));
        } finally {
            if (sqlIds != null) sqlIds.free();
        }
        String colorsJson = row.getString("item_colors");
        Map<String, String> colors = new LinkedHashMap<>();
        if (colorsJson != null) {
            Object parsed = json.readValue(colorsJson, Object.class);
            if (!(parsed instanceof Map<?, ?> values)) throw new SQLException("invalid outfit colors");
            for (var entry : values.entrySet()) {
                if (!(entry.getKey() instanceof String key) || !(entry.getValue() instanceof String value)) {
                    throw new SQLException("invalid outfit color value");
                }
                colors.put(key, value);
            }
        }
        return new OutfitResponse(row.getObject("id", UUID.class), row.getObject("user_id", UUID.class),
                row.getObject("date", LocalDate.class), row.getString("mood"), row.getString("weather"),
                row.getString("memo"), ids, Map.copyOf(colors), row.getBoolean("is_favorite"),
                row.getObject("created_at", OffsetDateTime.class));
    }
}
