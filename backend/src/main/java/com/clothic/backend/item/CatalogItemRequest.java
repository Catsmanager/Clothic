package com.clothic.backend.item;

import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** 소유자·메타데이터 대신 등록할 카탈로그 ID만 받는다. */
public record CatalogItemRequest(String catalogItemId) {

    static CatalogItemRequest fromJson(Map<String, Object> body) {
        if (body == null || !body.keySet().equals(Set.of("catalogItemId"))
                || !(body.get("catalogItemId") instanceof String id) || id.isBlank() || id.length() > 120) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "only a catalogItemId string is accepted");
        }
        return new CatalogItemRequest(id);
    }
}
