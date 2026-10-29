package dev.lichenkang.portfolio.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class WorkRequest {

    @NotBlank(message = "作品名称不能为空")
    private String name;

    private String description;

    @NotBlank(message = "作品链接不能为空")
    private String url;

    private String imagePath;
    private String videoPath;
    private List<String> tags;
    private boolean isShow = true;
    private Integer sortOrder = 0;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getVideoPath() {
        return videoPath;
    }

    public void setVideoPath(String videoPath) {
        this.videoPath = videoPath;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    // 前端发送/读取的字段名是 isShow；不加这层映射时 Jackson 会把它当成 show，导致开关静默失效。
    @JsonProperty("isShow")
    public boolean isShow() {
        return isShow;
    }

    @JsonProperty("isShow")
    public void setShow(boolean show) {
        isShow = show;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
