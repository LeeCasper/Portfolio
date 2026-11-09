package com.artaides.portfolio.service.model;

import com.artaides.portfolio.dto.HeadingDto;

import java.util.List;

public class MarkdownRenderResult {
    private final String html;
    private final List<HeadingDto> headings;

    public MarkdownRenderResult(String html, List<HeadingDto> headings) {
        this.html = html;
        this.headings = headings;
    }

    public String getHtml() {
        return html;
    }

    public List<HeadingDto> getHeadings() {
        return headings;
    }
}
