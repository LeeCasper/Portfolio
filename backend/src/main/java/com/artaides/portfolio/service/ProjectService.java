package com.artaides.portfolio.service;

import com.artaides.portfolio.config.ContentStorageProperties;
import com.artaides.portfolio.dto.ProjectDto;
import com.artaides.portfolio.entity.Project;
import com.artaides.portfolio.repository.ProjectRepository;
import com.artaides.portfolio.request.ProjectRequest;
import com.artaides.portfolio.util.MediaPathUtils;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ContentStorageProperties storageProperties;

    public ProjectService(ProjectRepository projectRepository, ContentStorageProperties storageProperties) {
        this.projectRepository = projectRepository;
        this.storageProperties = storageProperties;
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getPublishedProjects() {
        return projectRepository.findAllByPublishedTrueOrderBySortOrderAscTitleAsc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getAll() {
        return projectRepository.findAllByOrderBySortOrderAscTitleAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDto create(ProjectRequest request) {
        Project project = new Project();
        applyRequest(project, request);
        return toDto(projectRepository.save(project));
    }

    @Transactional
    public ProjectDto update(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found: " + id));
        applyRequest(project, request);
        return toDto(projectRepository.save(project));
    }

    @Transactional
    public void delete(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new EntityNotFoundException("Project not found: " + id);
        }
        projectRepository.deleteById(id);
    }

    private void applyRequest(Project project, ProjectRequest request) {
        String baseUrl = storageProperties.getMediaBaseUrl();
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setLink(request.getLink());
        project.setCoverImagePath(MediaPathUtils.normalize(request.getCoverImagePath(), baseUrl));
        project.setVideoPath(MediaPathUtils.normalize(request.getVideoPath(), baseUrl));
        project.setTags(request.getTags());
        project.setFeatured(request.isFeatured());
        project.setPublished(request.isPublished());
        project.setSortOrder(request.getSortOrder());
    }

    private ProjectDto toDto(Project project) {
        String baseUrl = storageProperties.getMediaBaseUrl();
        return new ProjectDto(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getLink(),
                MediaPathUtils.buildPublicUrl(project.getCoverImagePath(), baseUrl),
                MediaPathUtils.buildPublicUrl(project.getVideoPath(), baseUrl),
                project.getTags(),
                project.isFeatured(),
                project.isPublished(),
                project.getSortOrder(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
