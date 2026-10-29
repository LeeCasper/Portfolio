package dev.lichenkang.portfolio.security;

import dev.lichenkang.portfolio.config.ContentStorageProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * 后台接口的 Token 校验。
 *
 * <p>期望值来自 {@code CONTENT_ADMIN_TOKEN}，该配置没有默认值：未配置时应用会在启动阶段
 * 直接失败（见 {@link ContentStorageProperties}），而不是退回到一个公开可猜的密码。
 */
@Component
public class AdminTokenVerifier {

    private final ContentStorageProperties properties;

    public AdminTokenVerifier(ContentStorageProperties properties) {
        this.properties = properties;
    }

    /**
     * 校验请求头中的 Token，不匹配时抛出 401。
     */
    public void verify(String token) {
        String expected = properties.getAdminToken();
        if (token == null || token.isBlank() || !token.equals(expected)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "无效的后台 Token");
        }
    }
}
