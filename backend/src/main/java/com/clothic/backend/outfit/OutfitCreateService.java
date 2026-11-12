package com.clothic.backend.outfit;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.clothic.backend.item.ItemRepository;
import com.clothic.backend.item.ItemTemplateCatalog;

@Service
public class OutfitCreateService {
    public record Creation(OutfitResponse outfit, boolean created) { }
    private final OutfitRepository outfits;
    private final OutfitWriter writer;
    private final ItemRepository items;
    private final ItemTemplateCatalog catalog;

    public OutfitCreateService(OutfitRepository outfits, OutfitWriter writer, ItemRepository items, ItemTemplateCatalog catalog) {
        this.outfits = outfits;
        this.writer = writer;
        this.items = items;
        this.catalog = catalog;
    }

    @Transactional
    public Creation create(UUID userId, OutfitCreateRequest input) {
        // 이미 저장한 요청은 원래 아이템이 나중에 없어져도 같은 내용을 재조회할 수 있다.
        var existing = outfits.findOwnedById(userId, input.requestId());
        if (existing.isPresent()) return replay(input, existing.get());
        for (String id : input.itemIds()) {
            UUID ownedId;
            try {
                ownedId = UUID.fromString(id);
            } catch (IllegalArgumentException error) {
                catalog.require(id);
                continue;
            }
            if (items.findByIdAndUserId(ownedId, userId).isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unavailable outfit item");
            }
        }
        boolean created = writer.insertIfAbsent(userId, input) == 1;
        var row = outfits.findOwnedById(userId, input.requestId()).orElseThrow(OutfitCreateService::conflict);
        if (!created) return replay(input, row);
        return new Creation(row, true);
    }

    private static Creation replay(OutfitCreateRequest input, OutfitResponse row) {
        if (!input.matches(row)) throw conflict();
        return new Creation(row, false);
    }

    private static ResponseStatusException conflict() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "save request conflicts with an existing record");
    }
}
