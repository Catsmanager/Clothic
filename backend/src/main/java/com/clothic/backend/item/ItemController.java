package com.clothic.backend.item;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;

/**
 * GET/POST /api/items — 사용자 ID는 요청값이 아닌 검증된 토큰의 sub에서만 얻는다.
 */
@RestController
public class ItemController {

    private static final List<String> FORBIDDEN_USER_PARAMS = List.of("userId", "user_id");

    private final ItemQueryService service;
    private final CatalogItemService catalogItems;

    public ItemController(ItemQueryService service, CatalogItemService catalogItems) {
        this.service = service;
        this.catalogItems = catalogItems;
    }

    @GetMapping(value = "/api/items", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ItemResponse> listOwnedItems(@AuthenticationPrincipal Jwt jwt, HttpServletRequest request) {
        rejectUserParameters(request);
        UUID userId = parseSubject(jwt.getSubject());
        return service.findOwnedItems(userId).stream()
                .map(ItemContract::toResponse)
                .flatMap(Optional::stream)
                .toList();
    }

    @PostMapping(value = "/api/items", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ItemResponse> registerCatalogItem(@AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> body, HttpServletRequest request) {
        rejectUserParameters(request);
        UUID userId = parseSubject(jwt.getSubject());
        CatalogItemRequest input = CatalogItemRequest.fromJson(body);
        CatalogItemService.Registration result = catalogItems.register(userId, input.catalogItemId());
        return ResponseEntity.status(result.created() ? HttpStatus.CREATED : HttpStatus.OK).body(result.item());
    }

    private static void rejectUserParameters(HttpServletRequest request) {
        for (String param : FORBIDDEN_USER_PARAMS) {
            if (request.getParameterMap().containsKey(param)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "the target user is taken from the access token, not from request parameters");
            }
        }
    }

    private static UUID parseSubject(String subject) {
        try {
            return UUID.fromString(subject);
        } catch (IllegalArgumentException e) {
            // Supabase 사용자 ID는 UUID다. 형식이 다르면 인증 주체를 신뢰할 수 없으므로 거부한다.
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "the token subject is not a user id");
        }
    }
}
