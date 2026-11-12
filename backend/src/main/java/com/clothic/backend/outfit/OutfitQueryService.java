package com.clothic.backend.outfit;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OutfitQueryService {
    private final OutfitRepository repository;

    public OutfitQueryService(OutfitRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<OutfitResponse> findOwnedOutfits(UUID authenticatedUserId) {
        return repository.findOwned(Objects.requireNonNull(authenticatedUserId, "authenticatedUserId"));
    }
}
