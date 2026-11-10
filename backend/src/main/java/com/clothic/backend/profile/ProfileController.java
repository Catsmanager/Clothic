package com.clothic.backend.profile;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * GET·PATCH /api/profile — 토큰 sub 사용자의 프로필만 다룬다. 경로·본문으로 다른 사용자를 지정할 수 없다.
 */
@RestController
public class ProfileController {

    private final ProfileService service;

    public ProfileController(ProfileService service) {
        this.service = service;
    }

    @GetMapping(value = "/api/profile", produces = MediaType.APPLICATION_JSON_VALUE)
    public ProfileResponse getOwnProfile(@AuthenticationPrincipal Jwt jwt) {
        return service.findOwnProfile(userId(jwt))
                .map(ProfileResponse::from)
                .orElseThrow(ProfileController::profileMissing);
    }

    @PatchMapping(value = "/api/profile", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ProfileResponse updateOwnProfile(@AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> body) {
        ProfileUpdateRequest request;
        try {
            request = ProfileUpdateRequest.fromJson(body);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
        return service.updateOwnProfile(userId(jwt), request)
                .map(ProfileResponse::from)
                .orElseThrow(ProfileController::profileMissing);
    }

    private static ResponseStatusException profileMissing() {
        // 가입 트리거가 행을 만들기 때문에 없음은 비정상 상태다. 서버가 임의로 만들지 않고 알린다.
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "profile for the authenticated user does not exist");
    }

    private static UUID userId(Jwt jwt) {
        try {
            return UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "the token subject is not a user id");
        }
    }
}
