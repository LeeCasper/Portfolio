package dev.lichenkang.portfolio.controller;

import dev.lichenkang.portfolio.dto.MediaAssetDto;
import dev.lichenkang.portfolio.security.AdminTokenVerifier;
import dev.lichenkang.portfolio.service.FileStorageService;
import dev.lichenkang.portfolio.service.MediaAssetService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.util.Set;

@RestController
public class MediaController {

    private static final String HEADER_NAME = "X-ADMIN-TOKEN";

    /**
     * 允许以 inline 方式回源的内容类型。其余一律强制下载，避免上传物被浏览器当作可执行内容渲染。
     */
    private static final Set<String> INLINE_SAFE_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            MediaType.IMAGE_GIF_VALUE,
            "image/webp",
            "image/avif",
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "text/plain",
            MediaType.APPLICATION_PDF_VALUE);

    private final MediaAssetService mediaAssetService;
    private final FileStorageService fileStorageService;
    private final AdminTokenVerifier adminTokenVerifier;

    public MediaController(MediaAssetService mediaAssetService,
                           FileStorageService fileStorageService,
                           AdminTokenVerifier adminTokenVerifier) {
        this.mediaAssetService = mediaAssetService;
        this.fileStorageService = fileStorageService;
        this.adminTokenVerifier = adminTokenVerifier;
    }

    @PostMapping("/api/admin/media/upload")
    public ResponseEntity<MediaAssetDto> upload(@RequestHeader(HEADER_NAME) String token,
                                                @RequestParam("file") MultipartFile file,
                                                @RequestParam(value = "category", required = false, defaultValue = "misc") String category) {
        adminTokenVerifier.verify(token);
        return ResponseEntity.ok(mediaAssetService.upload(file, category));
    }

    @GetMapping("/api/files/**")
    public ResponseEntity<Resource> serve(HttpServletRequest request) throws IOException {
        String requestPath = request.getRequestURI();
        String filePath = requestPath.substring("/api/files/".length());

        Resource resource = fileStorageService.loadAsResource(filePath);
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "文件不存在");
        }

        String contentType = Files.probeContentType(resource.getFile().toPath());
        boolean inlineSafe = contentType != null && INLINE_SAFE_TYPES.contains(contentType);
        MediaType mediaType = inlineSafe
                ? MediaType.parseMediaType(contentType)
                : MediaType.APPLICATION_OCTET_STREAM;
        String disposition = (inlineSafe ? "inline" : "attachment") + "; filename=\"" + resource.getFilename() + "\"";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .contentType(mediaType)
                .body(resource);
    }
}
