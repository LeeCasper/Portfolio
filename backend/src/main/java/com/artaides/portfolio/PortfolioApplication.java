package com.artaides.portfolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PortfolioApplication {

    public static void main(String[] args) throws IOException {
        ensureDataDirectory();
        SpringApplication.run(PortfolioApplication.class, args);
    }

    /**
     * SQLite 不会自动创建缺失的父目录，目录不存在时驱动会直接报
     * "unable to open database file"。这里必须在 DataSource 初始化之前建好目录，
     * 因此放在 main() 里而不是某个 bean 中，保证全新克隆也能直接启动。
     */
    private static void ensureDataDirectory() throws IOException {
        String dataPath = System.getenv().getOrDefault("CONTENT_DATA_PATH", "storage/data");
        Path directory = Paths.get(dataPath).toAbsolutePath().normalize();
        Files.createDirectories(directory);
    }
}
