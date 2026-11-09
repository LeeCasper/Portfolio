package com.artaides.portfolio.service;

import com.artaides.portfolio.config.ContentStorageProperties;
import com.artaides.portfolio.dto.ProfileDto;
import com.artaides.portfolio.entity.Profile;
import com.artaides.portfolio.repository.ProfileRepository;
import com.artaides.portfolio.request.ProfileRequest;
import com.artaides.portfolio.util.MediaPathUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final ContentStorageProperties storageProperties;

    public ProfileService(ProfileRepository profileRepository, ContentStorageProperties storageProperties) {
        this.profileRepository = profileRepository;
        this.storageProperties = storageProperties;
    }

    @Transactional(readOnly = true)
    public ProfileDto getProfile() {
        return profileRepository.findTopByOrderByIdAsc()
                .map(this::toDto)
                .orElse(null);
    }

    @Transactional
    public ProfileDto upsert(ProfileRequest request) {
        Profile profile = profileRepository.findTopByOrderByIdAsc()
                .orElseGet(Profile::new);
        applyRequest(profile, request);
        return toDto(profileRepository.save(profile));
    }

    private void applyRequest(Profile profile, ProfileRequest request) {
        String baseUrl = storageProperties.getMediaBaseUrl();
        profile.setFullName(request.getFullName());
        profile.setHeadline(request.getHeadline());
        profile.setBio(request.getBio());
        profile.setEmail(request.getEmail());
        profile.setPhone(request.getPhone());
        profile.setWechat(request.getWechat());
        profile.setLocation(request.getLocation());
        profile.setJobTitle(request.getJobTitle());
        profile.setHeroImagePath(MediaPathUtils.normalize(request.getHeroImagePath(), baseUrl));
        profile.setResumePath(MediaPathUtils.normalize(request.getResumePath(), baseUrl));
        profile.setPrimaryCtaLabel(request.getPrimaryCtaLabel());
        profile.setPrimaryCtaLink(request.getPrimaryCtaLink());
        profile.setSecondaryCtaLabel(request.getSecondaryCtaLabel());
        profile.setSecondaryCtaLink(request.getSecondaryCtaLink());
    }

    private ProfileDto toDto(Profile profile) {
        String baseUrl = storageProperties.getMediaBaseUrl();
        return new ProfileDto(
                profile.getId(),
                profile.getFullName(),
                profile.getHeadline(),
                profile.getBio(),
                profile.getEmail(),
                profile.getPhone(),
                profile.getWechat(),
                profile.getLocation(),
                profile.getJobTitle(),
                MediaPathUtils.buildPublicUrl(profile.getHeroImagePath(), baseUrl),
                MediaPathUtils.buildPublicUrl(profile.getResumePath(), baseUrl),
                profile.getPrimaryCtaLabel(),
                profile.getPrimaryCtaLink(),
                profile.getSecondaryCtaLabel(),
                profile.getSecondaryCtaLink(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
