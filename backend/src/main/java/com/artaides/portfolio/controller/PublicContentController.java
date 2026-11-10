package com.artaides.portfolio.controller;

import com.artaides.portfolio.dto.BlogPostDto;
import com.artaides.portfolio.dto.ProfileDto;
import com.artaides.portfolio.dto.WorkDto;
import com.artaides.portfolio.service.BlogPostService;
import com.artaides.portfolio.service.ProfileService;
import com.artaides.portfolio.service.WorkService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicContentController {

    private final BlogPostService blogPostService;
    private final ProfileService profileService;
    private final WorkService workService;

    public PublicContentController(BlogPostService blogPostService, ProfileService profileService, WorkService workService) {
        this.blogPostService = blogPostService;
        this.profileService = profileService;
        this.workService = workService;
    }

    @GetMapping("/blog-posts")
    public ResponseEntity<List<BlogPostDto>> getBlogPosts() {
        return ResponseEntity.ok(blogPostService.getPublishedPosts());
    }

    @GetMapping("/blog-posts/{slug}")
    public ResponseEntity<BlogPostDto> getBlogPost(@PathVariable String slug) {
        return ResponseEntity.ok(blogPostService.getBySlug(slug));
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDto> getProfile() {
        ProfileDto profile = profileService.getProfile();
        if (profile == null) {
            // 尚未配置个人信息时返回 404，而不是 200 + 空响应体（空体无法被客户端当 JSON 解析）。
            throw new EntityNotFoundException("Profile not set");
        }
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/works")
    public ResponseEntity<List<WorkDto>> getWorks() {
        return ResponseEntity.ok(workService.getVisibleWorks());
    }
}
