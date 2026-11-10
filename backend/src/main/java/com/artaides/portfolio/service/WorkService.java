package com.artaides.portfolio.service;

import com.artaides.portfolio.config.ContentStorageProperties;
import com.artaides.portfolio.dto.WorkDto;
import com.artaides.portfolio.entity.Work;
import com.artaides.portfolio.repository.WorkRepository;
import com.artaides.portfolio.request.WorkRequest;
import com.artaides.portfolio.util.MediaPathUtils;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkService {

    private final WorkRepository workRepository;
    private final ContentStorageProperties storageProperties;

    public WorkService(WorkRepository workRepository, ContentStorageProperties storageProperties) {
        this.workRepository = workRepository;
        this.storageProperties = storageProperties;
    }

    @Transactional(readOnly = true)
    public List<WorkDto> getVisibleWorks() {
        return workRepository.findByIsShowTrueOrderBySortOrderAsc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkDto> getAll() {
        return workRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkDto create(WorkRequest request) {
        Work work = new Work();
        applyRequest(work, request);
        return toDto(workRepository.save(work));
    }

    @Transactional
    public WorkDto update(Long id, WorkRequest request) {
        Work work = workRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Work not found: " + id));
        applyRequest(work, request);
        return toDto(workRepository.save(work));
    }

    @Transactional
    public void delete(Long id) {
        if (!workRepository.existsById(id)) {
            throw new EntityNotFoundException("Work not found: " + id);
        }
        workRepository.deleteById(id);
    }

    private void applyRequest(Work work, WorkRequest request) {
        String baseUrl = storageProperties.getMediaBaseUrl();
        work.setName(request.getName());
        work.setDescription(request.getDescription());
        work.setUrl(request.getUrl());
        work.setImagePath(MediaPathUtils.normalize(request.getImagePath(), baseUrl));
        work.setVideoPath(MediaPathUtils.normalize(request.getVideoPath(), baseUrl));
        work.setTags(request.getTags());
        work.setFeatures(request.getFeatures());
        work.setShow(request.isShow());
        work.setSortOrder(request.getSortOrder());
    }

    private WorkDto toDto(Work work) {
        String baseUrl = storageProperties.getMediaBaseUrl();
        return new WorkDto(
                work.getId(),
                work.getName(),
                work.getDescription(),
                work.getUrl(),
                MediaPathUtils.buildPublicUrl(work.getImagePath(), baseUrl),
                MediaPathUtils.buildPublicUrl(work.getVideoPath(), baseUrl),
                work.getTags(),
                work.getFeatures(),
                work.isShow(),
                work.getSortOrder(),
                work.getCreatedAt(),
                work.getUpdatedAt()
        );
    }
}
