package com.clothic.backend.item;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 인증된 사용자 ID로만 아이템을 조회한다. 조회 조건은 항상 user_id = 인증 사용자이며 메모리에서 거르지 않는다.
 */
@Service
public class ItemQueryService {

    private final ItemRepository repository;

    public ItemQueryService(ItemRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Item> findOwnedItems(UUID authenticatedUserId) {
        Objects.requireNonNull(authenticatedUserId, "authenticatedUserId");
        return repository.findByUserIdOrderByCreatedAtDescIdAsc(authenticatedUserId);
    }
}
