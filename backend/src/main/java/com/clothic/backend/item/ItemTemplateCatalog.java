package com.clothic.backend.item;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import tools.jackson.databind.ObjectMapper;

/** 앱의 canonical 카탈로그에서 내보낸 메타데이터. 일치 여부는 앱 핵심 검사에서도 확인한다. */
@Component
public class ItemTemplateCatalog {

    public record Template(String id, String name, String category, String imagePath, String color,
            List<String> styleTags) {
        public Template {
            styleTags = List.copyOf(styleTags);
        }
    }

    private final Map<String, Template> templates;

    public ItemTemplateCatalog(ObjectMapper mapper) {
        try (var input = new ClassPathResource("catalog-items.json").getInputStream()) {
            Map<String, Template> index = new LinkedHashMap<>();
            for (Template template : mapper.readValue(input, Template[].class)) {
                if (template.id() == null || template.id().isBlank()
                        || template.name() == null || template.name().isBlank()
                        || template.imagePath() == null || template.color() == null
                        || !ItemContract.CATEGORIES.contains(template.category())
                        || !ItemContract.STYLE_TAGS.containsAll(template.styleTags())
                        || index.putIfAbsent(template.id(), template) != null) {
                    throw new IllegalStateException("Invalid or duplicate server catalog template");
                }
            }
            if (index.isEmpty()) throw new IllegalStateException("The server catalog must not be empty");
            templates = Map.copyOf(index);
        } catch (IOException error) {
            throw new IllegalStateException("Cannot load the server item catalog", error);
        }
    }

    public Template require(String catalogItemId) {
        Template template = templates.get(catalogItemId);
        if (template == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unknown catalog item");
        }
        return template;
    }
}
