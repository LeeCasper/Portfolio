package dev.lichenkang.portfolio.controller;

import dev.lichenkang.portfolio.dto.BlogPostDto;
import dev.lichenkang.portfolio.dto.ProfileDto;
import dev.lichenkang.portfolio.dto.ProjectDto;
import dev.lichenkang.portfolio.dto.WorkDto;
import dev.lichenkang.portfolio.request.BlogPostRequest;
import dev.lichenkang.portfolio.request.ProfileRequest;
import dev.lichenkang.portfolio.request.ProjectRequest;
import dev.lichenkang.portfolio.request.WorkRequest;
import dev.lichenkang.portfolio.security.AdminTokenVerifier;
import dev.lichenkang.portfolio.service.BlogPostService;
import dev.lichenkang.portfolio.service.ProfileService;
import dev.lichenkang.portfolio.service.ProjectService;
import dev.lichenkang.portfolio.service.WorkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminContentController {

    private static final String HEADER_NAME = "X-ADMIN-TOKEN";

    private final ProjectService projectService;
    private final BlogPostService blogPostService;
    private final ProfileService profileService;
    private final WorkService workService;
    private final AdminTokenVerifier adminTokenVerifier;

    public AdminContentController(ProjectService projectService,
                                  BlogPostService blogPostService,
                                  ProfileService profileService,
                                  WorkService workService,
                                  AdminTokenVerifier adminTokenVerifier) {
        this.projectService = projectService;
        this.blogPostService = blogPostService;
        this.profileService = profileService;
        this.workService = workService;
        this.adminTokenVerifier = adminTokenVerifier;
    }

    @GetMapping("/projects")
    public ResponseEntity<List<ProjectDto>> listProjects(@RequestHeader(HEADER_NAME) String token) {
        adminTokenVerifier.verify(token);
        return ResponseEntity.ok(projectService.getAll());
    }

    @PostMapping("/projects")
    public ResponseEntity<ProjectDto> createProject(@RequestHeader(HEADER_NAME) String token,
                                                    @Valid @RequestBody ProjectRequest request) {
        adminTokenVerifier.verify(token);
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(request));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ProjectDto> updateProject(@RequestHeader(HEADER_NAME) String token,
                                                    @PathVariable Long id,
                                                    @Valid @RequestBody ProjectRequest request) {
        adminTokenVerifier.verify(token);
        return ResponseEntity.ok(projectService.update(id, request));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@RequestHeader(HEADER_NAME) String token,
                                              @PathVariable Long id) {
        adminTokenVerifier.verify(token);
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/blog-posts")
    public ResponseEntity<List<BlogPostDto>> listPosts(@RequestHeader(HEADER_NAME) String token) {
        adminTokenVerifier.verify(token);
        return ResponseEntity.ok(blogPostService.getAll());
    }

    @PostMapping("/blog-posts")
    public ResponseEntity<BlogPostDto> createPost(@RequestHeader(HEADER_NAME) String token,
                                                  @Valid @RequestBody BlogPostRequest request) {
        adminTokenVerifier.verify(token);
        return ResponseEntity.status(HttpStatus.CREATED).body(blogPostService.create(request));
    }

    @PutMapping("/blog-posts/{id}")
    public ResponseEntity<BlogPostDto> updatePost(@RequestHeader(HEADER_NAME) String token,
                                                  @PathVariable Long id,
                                                  @Valid @RequestBody BlogPostRequest request) {
        adminTokenVerifier.verify(token);
        return ResponseEntity.ok(blogPostService.update(id, request));
    }

    @DeleteMapping("/blog-posts/{id}")
    public ResponseEntity<Void> deletePost(@RequestHeader(HEADER_NAME) String token,
                                           @PathVariable Long id) {
        adminTokenVerifier.verify(token);
        blogPostService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDto> getProfile(@RequestHeader(HEADER_NAME) String token) {
        adminTokenVerifier.verify(token);
        return ResponseEntity.ok(profileService.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDto> updateProfile(@RequestHeader(HEADER_NAME) String token,
                                                    @Valid @RequestBody ProfileRequest request) {
        adminTokenVerifier.verify(token);
        return ResponseEntity.ok(profileService.upsert(request));
    }

    @GetMapping("/works")
    public ResponseEntity<List<WorkDto>> listWorks(@RequestHeader(HEADER_NAME) String token) {
        adminTokenVerifier.verify(token);
        return ResponseEntity.ok(workService.getAll());
    }

    @PostMapping("/works")
    public ResponseEntity<WorkDto> createWork(@RequestHeader(HEADER_NAME) String token,
                                              @Valid @RequestBody WorkRequest request) {
        adminTokenVerifier.verify(token);
        return ResponseEntity.status(HttpStatus.CREATED).body(workService.create(request));
    }

    @PutMapping("/works/{id}")
    public ResponseEntity<WorkDto> updateWork(@RequestHeader(HEADER_NAME) String token,
                                              @PathVariable Long id,
                                              @Valid @RequestBody WorkRequest request) {
        adminTokenVerifier.verify(token);
        return ResponseEntity.ok(workService.update(id, request));
    }

    @DeleteMapping("/works/{id}")
    public ResponseEntity<Void> deleteWork(@RequestHeader(HEADER_NAME) String token,
                                           @PathVariable Long id) {
        adminTokenVerifier.verify(token);
        workService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
