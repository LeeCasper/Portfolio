package com.artaides.portfolio.dto;

import java.time.Instant;

public record ProfileDto(
        Long id,
        String fullName,
        String headline,
        String bio,
        String email,
        String phone,
        String wechat,
        String location,
        String jobTitle,
        String heroImageUrl,
        String avatarUrl,
        String logoUrl,
        String resumeUrl,
        String icpNumber,
        String icpUrl,
        String icpIconUrl,
        String policeNumber,
        String policeUrl,
        String policeIconUrl,
        String primaryCtaLabel,
        String primaryCtaLink,
        String secondaryCtaLabel,
        String secondaryCtaLink,
        Instant createdAt,
        Instant updatedAt
) {
}
