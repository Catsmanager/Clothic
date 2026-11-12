package com.clothic.backend.outfit;

import java.sql.Array;
import java.util.Objects;
import java.util.UUID;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.ObjectMapper;

@Repository
public class OutfitWriter {
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;

    public OutfitWriter(JdbcTemplate jdbc, ObjectMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    int updateDiary(UUID userId, UUID outfitId, OutfitDiaryPatch patch) {
        if (patch.hasMood() && patch.hasMemo()) {
            return jdbc.update("update public.outfits set mood=?, memo=? where user_id=? and id=?",
                    patch.mood(), patch.memo(), userId, outfitId);
        }
        if (patch.hasMood()) {
            return jdbc.update("update public.outfits set mood=? where user_id=? and id=?",
                    patch.mood(), userId, outfitId);
        }
        return jdbc.update("update public.outfits set memo=? where user_id=? and id=?",
                patch.memo(), userId, outfitId);
    }

    int insertIfAbsent(UUID userId, OutfitCreateRequest input) {
        return Objects.requireNonNull(jdbc.execute((ConnectionCallback<Integer>) connection -> {
            try (var statement = connection.prepareStatement("""
                    insert into public.outfits (id,user_id,date,mood,weather,memo,item_ids,item_colors)
                    values (?,?,?,?,?,?,?,?::jsonb) on conflict (id) do nothing
                    """)) {
                Array ids = connection.createArrayOf("text", input.itemIds().toArray(String[]::new));
                try {
                    statement.setObject(1, input.requestId());
                    statement.setObject(2, userId);
                    statement.setObject(3, input.date());
                    statement.setString(4, input.mood());
                    statement.setString(5, input.weather());
                    statement.setString(6, input.memo());
                    statement.setArray(7, ids);
                    statement.setString(8, json.writeValueAsString(input.itemColors()));
                    return statement.executeUpdate();
                } finally {
                    ids.free();
                }
            }
        }));
    }
}
