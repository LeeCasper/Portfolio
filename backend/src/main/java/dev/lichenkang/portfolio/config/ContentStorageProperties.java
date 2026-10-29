package dev.lichenkang.portfolio.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;

@Validated
@ConfigurationProperties(prefix = "content")
public class ContentStorageProperties {

    /**
     * 媒体文件存储根目录
     */
    private String storageRoot = "storage/media";

    /**
     * 媒体文件访问基地址
     */
    private String mediaBaseUrl = "http://localhost:8081/api/files";

    /**
     * 后台管理 Token。没有默认值：必须通过环境变量 CONTENT_ADMIN_TOKEN 显式配置，
     * 否则应用启动失败，避免用一个公开可猜的弱口令把后台暴露出去。
     */
    @NotBlank(message = "必须通过环境变量 CONTENT_ADMIN_TOKEN 配置后台管理 Token")
    private String adminToken;

    /**
     * 允许的 CORS 来源
     */
    private List<String> allowedOrigins = new ArrayList<>();

    public String getStorageRoot() {
        return storageRoot;
    }

    public void setStorageRoot(String storageRoot) {
        this.storageRoot = storageRoot;
    }

    public String getMediaBaseUrl() {
        return mediaBaseUrl;
    }

    public void setMediaBaseUrl(String mediaBaseUrl) {
        this.mediaBaseUrl = mediaBaseUrl;
    }

    public String getAdminToken() {
        return adminToken;
    }

    public void setAdminToken(String adminToken) {
        this.adminToken = adminToken;
    }

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }
}
