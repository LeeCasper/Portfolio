package dev.lichenkang.portfolio.service;

import dev.lichenkang.portfolio.config.ContentStorageProperties;
import dev.lichenkang.portfolio.service.model.StoredFile;
import dev.lichenkang.portfolio.util.MediaPathUtils;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class FileStorageService {

    /** category 只当作一层目录名使用，限制字符集以杜绝 `../` 之类的目录穿越。 */
    private static final Pattern CATEGORY_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]{1,32}$");

    /**
     * 允许上传的扩展名白名单。刻意不包含 .html/.svg/.jsp 等可被浏览器当作可执行内容渲染的类型。
     */
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif",
            ".mp4", ".webm", ".mov",
            ".pdf", ".md", ".txt");

    private final Path storageLocation;
    private final String mediaBaseUrl;

    public FileStorageService(ContentStorageProperties properties) {
        this.storageLocation = Paths.get(properties.getStorageRoot()).toAbsolutePath().normalize();
        this.mediaBaseUrl = properties.getMediaBaseUrl();

        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create storage directory", e);
        }
    }

    public StoredFile store(MultipartFile file, String subfolder) {
        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "" : file.getOriginalFilename());

        if (originalFilename.isBlank() || originalFilename.contains("..")) {
            throw new IllegalArgumentException("非法文件名: " + originalFilename);
        }
        if (subfolder == null || !CATEGORY_PATTERN.matcher(subfolder).matches()) {
            throw new IllegalArgumentException("非法的分类名: " + subfolder);
        }

        String extension = extractExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("不支持的文件类型: " + extension);
        }

        try {
            String uniqueFilename = UUID.randomUUID() + extension;
            Path subfolderPath = this.storageLocation.resolve(subfolder);
            Files.createDirectories(subfolderPath);

            Path targetLocation = subfolderPath.resolve(uniqueFilename);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            String relativePath = subfolder + "/" + uniqueFilename;
            String accessUrl = this.mediaBaseUrl + "/" + relativePath;

            return new StoredFile(
                    originalFilename,
                    uniqueFilename,
                    relativePath,
                    accessUrl,
                    file.getContentType(),
                    file.getSize(),
                    Instant.now());

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + originalFilename, e);
        }
    }

    /**
     * 把相对路径解析为磁盘路径，并确保结果仍位于存储根目录内（防止 {@code ../} 越界读取）。
     */
    public Path loadFile(String relativePath) {
        Path resolved = storageLocation.resolve(relativePath).normalize();
        if (resolved.equals(storageLocation) || !resolved.startsWith(storageLocation)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "文件不存在");
        }
        return resolved;
    }

    public Resource loadAsResource(String relativePath) {
        return new FileSystemResource(loadFile(relativePath).toFile());
    }

    public String buildPublicUrl(String relativePath) {
        return MediaPathUtils.buildPublicUrl(relativePath, this.mediaBaseUrl);
    }

    private static String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0) {
            return "";
        }
        return filename.substring(dotIndex).toLowerCase(Locale.ROOT);
    }
}
