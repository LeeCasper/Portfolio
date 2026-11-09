package com.artaides.portfolio.dto;

import java.time.Instant;

public record MediaAssetDto(
        Long id,
        String originalFilename,
        String relativePath,
        String publicUrl,
        String mimeType,
        long sizeInBytes,
        String category,
        Instant createdAt
) {
}
