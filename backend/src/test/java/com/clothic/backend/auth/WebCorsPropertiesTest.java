package com.clothic.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.Test;

class WebCorsPropertiesTest {

    @Test
    void emptyConfigurationDoesNotAllowAnOrigin() {
        assertEquals(List.of(), new WebCorsProperties(null).allowedOrigins());
    }

    @Test
    void wildcardOrNonOriginConfigurationIsRejected() {
        for (String invalid : List.of("*", "https://*.example.com", "https://example.com/path",
                "https://user@example.com", "https://example.com?token=value")) {
            assertThrows(IllegalArgumentException.class, () -> new WebCorsProperties(List.of(invalid)));
        }
    }
}
