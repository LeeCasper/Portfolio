package com.artaides.portfolio.service;

import com.artaides.portfolio.config.ContentStorageProperties;
import com.artaides.portfolio.dto.BlogPostDto;
import com.artaides.portfolio.entity.BlogPost;
import com.artaides.portfolio.repository.BlogPostRepository;
import com.artaides.portfolio.request.BlogPostRequest;
import com.artaides.portfolio.util.MediaPathUtils;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BlogPostService {

    private final BlogPostRepository blogPostRepository;
    private final ContentStorageProperties storageProperties;
    private final MarkdownService markdownService;

    public BlogPostService(BlogPostRepository blogPostRepository,
                           ContentStorageProperties storageProperties,
                           MarkdownService markdownService) {
        this.blogPostRepository = blogPostRepository;
        this.storageProperties = storageProperties;
        this.markdownService = markdownService;
    }

    @Transactional(readOnly = true)
    public List<BlogPostDto> getPublishedPosts() {
        return blogPostRepository.findAllByPublishedTrueAndPublishDateBeforeOrderByPublishDateDesc(Instant.now())
                .stream()
                .map(this::toListDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BlogPostDto getBySlug(String slug) {
        // 只返回已发布且发布时间已到的文章，未发布的草稿不能通过公开接口按 slug 读到。
        return blogPostRepository.findBySlugAndPublishedTrueAndPublishDateBefore(slug, Instant.now())
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + slug));
    }

    @Transactional
    public BlogPostDto create(BlogPostRequest request) {
        BlogPost post = new BlogPost();
        applyRequest(post, request);
        return toDto(blogPostRepository.save(post));
    }

    @Transactional
    public BlogPostDto update(Long id, BlogPostRequest request) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + id));
        applyRequest(post, request);
        return toDto(blogPostRepository.save(post));
    }

    @Transactional(readOnly = true)
    public List<BlogPostDto> getAll() {
        return blogPostRepository.findAllByOrderByPublishDateDescIdDesc().stream()
                .map(this::toListDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
        if (!blogPostRepository.existsById(id)) {
            throw new EntityNotFoundException("Post not found: " + id);
        }
        blogPostRepository.deleteById(id);
    }

    private void applyRequest(BlogPost post, BlogPostRequest request) {
        post.setTitle(request.getTitle());
        post.setSlug(request.getSlug());
        post.setSummary(request.getSummary());
        post.setContent(request.getContent());
        post.setCoverImagePath(MediaPathUtils.normalize(request.getCoverImagePath(), storageProperties.getMediaBaseUrl()));
        post.setPublishDate(request.getPublishDate());
        post.setFeatured(request.isFeatured());
        post.setPublished(request.isPublished());
        post.setTags(request.getTags());
    }

    /**
     * 列表用映射：不渲染 Markdown。此前列表接口会为每篇文章重复渲染全文，
     * 而列表页只用 summary / tags / coverImageUrl / slug / publishDate。
     */
    private BlogPostDto toListDto(BlogPost post) {
        String baseUrl = storageProperties.getMediaBaseUrl();
        return new BlogPostDto(
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getSummary(),
                post.getContent(),
                null,
                null,
                MediaPathUtils.buildPublicUrl(post.getCoverImagePath(), baseUrl),
                post.getPublishDate(),
                post.isFeatured(),
                post.isPublished(),
                post.getTags(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    /**
     * 详情用映射：渲染 Markdown 得到正文 HTML 与目录。
     */
    private BlogPostDto toDto(BlogPost post) {
        var renderResult = markdownService.render(post.getContent());
        String baseUrl = storageProperties.getMediaBaseUrl();
        return new BlogPostDto(
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getSummary(),
                post.getContent(),
                renderResult.getHtml(),
                renderResult.getHeadings(),
                MediaPathUtils.buildPublicUrl(post.getCoverImagePath(), baseUrl),
                post.getPublishDate(),
                post.isFeatured(),
                post.isPublished(),
                post.getTags(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
