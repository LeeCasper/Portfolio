package dev.lichenkang.portfolio.dto;

import java.time.Instant;
import java.util.List;

/**
 * 文章数据。
 *
 * <p>{@code contentHtml} 与 {@code headings} 由 Markdown 渲染得到，只在详情接口返回；
 * 列表接口为省去重复渲染会将其置为 {@code null}。
 */
public record BlogPostDto(
        Long id,
        String title,
        String slug,
        String summary,
        String content,
        String contentHtml,
        List<HeadingDto> headings,
        String coverImageUrl,
        Instant publishDate,
        boolean featured,
        boolean published,
        List<String> tags,
        Instant createdAt,
        Instant updatedAt
) {
}
