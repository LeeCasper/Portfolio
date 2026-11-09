package com.artaides.portfolio.repository;

import com.artaides.portfolio.entity.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    Optional<BlogPost> findBySlugAndPublishedTrueAndPublishDateBefore(String slug, Instant now);

    List<BlogPost> findAllByPublishedTrueAndPublishDateBeforeOrderByPublishDateDesc(Instant now);

    List<BlogPost> findAllByOrderByPublishDateDescIdDesc();
}
