package com.clothic.backend.outfit;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class OutfitController {
    private final OutfitQueryService service;

    private final OutfitCreateService creation;

    public OutfitController(OutfitQueryService service, OutfitCreateService creation) {
        this.service = service;
        this.creation = creation;
    }

    @GetMapping(value = "/api/outfits", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<OutfitResponse> listOwnedOutfits(@AuthenticationPrincipal Jwt jwt, HttpServletRequest request) {
        rejectUserParameters(request);
        return service.findOwnedOutfits(parseUuid(jwt.getSubject(), HttpStatus.UNAUTHORIZED));
    }

    @GetMapping(value = "/api/outfits/{outfitId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public OutfitResponse getOwnedOutfit(@AuthenticationPrincipal Jwt jwt,
            @PathVariable String outfitId, HttpServletRequest request) {
        rejectUserParameters(request);
        UUID userId = parseUuid(jwt.getSubject(), HttpStatus.UNAUTHORIZED);
        UUID id = parseUuid(outfitId, HttpStatus.BAD_REQUEST);
        // 타인 기록과 없는 기록은 같은 404다. ID만으로 먼저 조회하지 않는다.
        return service.findOwnedOutfit(userId, id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "outfit not found"));
    }

    @PostMapping(value = "/api/outfits", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<OutfitResponse> createOutfit(@AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> body, HttpServletRequest request) {
        rejectUserParameters(request);
        UUID userId = parseUuid(jwt.getSubject(), HttpStatus.UNAUTHORIZED);
        var result = creation.create(userId, OutfitCreateRequest.fromJson(body));
        return ResponseEntity.status(result.created() ? HttpStatus.CREATED : HttpStatus.OK).body(result.outfit());
    }

    private static void rejectUserParameters(HttpServletRequest request) {
        for (String parameter : List.of("userId", "user_id")) {
            if (request.getParameterMap().containsKey(parameter)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "the target user comes from the token");
            }
        }
    }

    private static UUID parseUuid(String value, HttpStatus failureStatus) {
        try {
            UUID parsed = UUID.fromString(value);
            if (!parsed.toString().equalsIgnoreCase(value)) throw new IllegalArgumentException("non-canonical UUID");
            return parsed;
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(failureStatus, "invalid identifier");
        }
    }
}
