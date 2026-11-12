package com.clothic.backend.item;

import java.util.Objects;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CatalogItemService {

    public record Registration(ItemResponse item, boolean created) {}

    private final ItemTemplateCatalog catalog;
    private final CatalogItemWriter writer;
    private final ItemRepository repository;

    public CatalogItemService(ItemTemplateCatalog catalog, CatalogItemWriter writer, ItemRepository repository) {
        this.catalog = catalog;
        this.writer = writer;
        this.repository = repository;
    }

    @Transactional
    public Registration register(UUID userId, String catalogItemId) {
        Objects.requireNonNull(userId, "authenticatedUserId");
        ItemTemplateCatalog.Template template = catalog.require(catalogItemId);
        boolean created = writer.insertIfAbsent(userId, template) == 1;
        Item item = repository.findByUserIdAndCatalogItemId(userId, catalogItemId)
                .orElseThrow(() -> new IllegalStateException("Registered item could not be read"));
        ItemResponse response = ItemContract.toResponse(item).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.CONFLICT, "existing item is not compatible with the app"));
        return new Registration(response, created);
    }
}
