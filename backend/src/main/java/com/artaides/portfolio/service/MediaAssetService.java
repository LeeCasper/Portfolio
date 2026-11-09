package com.artaides.portfolio.service;

import com.artaides.portfolio.dto.MediaAssetDto;
import com.artaides.portfolio.entity.MediaAsset;
import com.artaides.portfolio.repository.MediaAssetRepository;
import com.artaides.portfolio.service.model.StoredFile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MediaAssetService {

    private final MediaAssetRepository mediaAssetRepository;
    private final FileStorageService fileStorageService;

    public MediaAssetService(MediaAssetRepository mediaAssetRepository, FileStorageService fileStorageService) {
        this.mediaAssetRepository = mediaAssetRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public MediaAssetDto upload(MultipartFile file, String category) {
        StoredFile storedFile = fileStorageService.store(file, category);

        MediaAsset asset = new MediaAsset();
        asset.setOriginalFilename(storedFile.getOriginalFilename());
        asset.setStoredFilename(storedFile.getStoredFileName());
        asset.setRelativePath(storedFile.getRelativePath());
        asset.setMimeType(storedFile.getContentType());
        asset.setSizeInBytes(storedFile.getSize());
        asset.setCategory(category);

        MediaAsset saved = mediaAssetRepository.save(asset);
        return toDto(saved, storedFile.getPublicUrl());
    }

    private MediaAssetDto toDto(MediaAsset asset, String publicUrl) {
        return new MediaAssetDto(
                asset.getId(),
                asset.getOriginalFilename(),
                asset.getRelativePath(),
                publicUrl,
                asset.getMimeType(),
                asset.getSizeInBytes(),
                asset.getCategory(),
                asset.getCreatedAt()
        );
    }

}
