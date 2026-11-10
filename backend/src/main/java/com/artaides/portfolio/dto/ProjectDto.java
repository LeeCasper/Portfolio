package com.artaides.portfolio.dto;

import java.time.Instant;
import java.util.List;

public record ProjectDto(
        Long id,
        String title,
        String description,
        String link,
        String coverImageUrl,
        String videoUrl,
        List<String> tags,
        List<String> features,
        boolean featured,
        boolean published,
        Integer sortOrder,
        Instant createdAt,
        Instant updatedAt
) {
}
