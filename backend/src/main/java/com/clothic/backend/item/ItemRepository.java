package com.clothic.backend.item;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.Repository;

/**
 * 읽기 전용 저장소. 사용자 조건이 없는 전체 조회 메서드는 노출하지 않는다.
 */
public interface ItemRepository extends Repository<Item, UUID> {

    List<Item> findByUserIdOrderByCreatedAtDescIdAsc(UUID userId);

    Optional<Item> findByIdAndUserId(UUID id, UUID userId);

    Optional<Item> findByUserIdAndCatalogItemId(UUID userId, String catalogItemId);
}
