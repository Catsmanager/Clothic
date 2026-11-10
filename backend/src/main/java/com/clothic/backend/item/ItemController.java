package com.clothic.backend.item;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;

/**
 * GET /api/items — 검증된 토큰의 sub 사용자가 소유한 아이템만 돌려준다. 사용자 ID는 요청값으로 받지 않는다.
 */
@RestController
public class ItemController {

    private static final List<String> FORBIDDEN_USER_PARAMS = List.of("userId", "user_id");

    private final ItemQueryService service;

    public ItemController(ItemQueryService service) {
        this.service = service;
    }

    @GetMapping(value = "/api/items", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ItemResponse> listOwnedItems(@AuthenticationPrincipal Jwt jwt, HttpServletRequest request) {
        for (String param : FORBIDDEN_USER_PARAMS) {
            if (request.getParameterMap().containsKey(param)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "the target user is taken from the access token, not from request parameters");
            }
        }
        UUID userId = parseSubject(jwt.getSubject());
        return service.findOwnedItems(userId).stream()
                .map(ItemContract::toResponse)
                .flatMap(Optional::stream)
                .toList();
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
