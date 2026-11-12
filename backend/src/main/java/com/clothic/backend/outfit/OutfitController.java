package com.clothic.backend.outfit;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class OutfitController {
    private final OutfitQueryService service;

    public OutfitController(OutfitQueryService service) {
        this.service = service;
    }

    @GetMapping(value = "/api/outfits", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<OutfitResponse> listOwnedOutfits(@AuthenticationPrincipal Jwt jwt, HttpServletRequest request) {
        for (String parameter : List.of("userId", "user_id")) {
            if (request.getParameterMap().containsKey(parameter)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "the target user comes from the token");
            }
        }
        UUID userId;
        try {
            userId = UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid user subject");
        }
        return service.findOwnedOutfits(userId);
    }
}
