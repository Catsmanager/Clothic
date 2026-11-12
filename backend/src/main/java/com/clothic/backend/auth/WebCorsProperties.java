package com.clothic.backend.auth;

import java.net.URI;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** 브라우저 API 호출을 허용할 정확한 출처 목록. 미설정 시 교차 출처 호출을 허용하지 않는다. */
@ConfigurationProperties(prefix = "clothic.web")
public record WebCorsProperties(List<String> allowedOrigins) {

    public WebCorsProperties {
        allowedOrigins = allowedOrigins == null ? List.of() : allowedOrigins.stream()
                .map(String::trim).filter(origin -> !origin.isEmpty()).distinct().toList();
        for (String origin : allowedOrigins) {
            URI uri = URI.create(origin);
            if (!("http".equals(uri.getScheme()) || "https".equals(uri.getScheme()))
                    || uri.getHost() == null || uri.getUserInfo() != null
                    || !uri.getRawPath().isEmpty() || uri.getRawQuery() != null || uri.getRawFragment() != null
                    || origin.contains("*")) {
                throw new IllegalArgumentException("clothic.web.allowed-origins requires explicit HTTP(S) origins");
            }
        }
    }
}
