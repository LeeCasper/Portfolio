package com.artaides.portfolio.dto;

import java.time.Instant;
import java.util.List;

public record WorkDto(
        Long id,
        String name,
        String description,
        String url,
        String imageUrl,
        String videoUrl,
        String qrCodeUrl,
        List<String> tags,
        List<String> features,
        boolean isShow,
        Integer sortOrder,
        Instant createdAt,
        Instant updatedAt
) {
}
