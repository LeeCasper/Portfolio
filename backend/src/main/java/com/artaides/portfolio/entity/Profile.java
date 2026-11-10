package com.artaides.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "profile")
public class Profile extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    private String headline;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String email;

    private String phone;

    private String wechat;

    private String location;

    private String jobTitle;

    private String heroImagePath;

    private String avatarPath;

    private String logoPath;

    private String resumePath;

    /** ICP 备案号与链接（链接为空时前端用工信部查询页） */
    private String icpNumber;

    private String icpUrl;

    private String icpIconPath;

    /** 公安备案号与链接 */
    private String policeNumber;

    private String policeUrl;

    private String policeIconPath;

    private String primaryCtaLabel;

    private String primaryCtaLink;

    private String secondaryCtaLabel;

    private String secondaryCtaLink;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWechat() {
        return wechat;
    }

    public void setWechat(String wechat) {
        this.wechat = wechat;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getHeroImagePath() {
        return heroImagePath;
    }

    public void setHeroImagePath(String heroImagePath) {
        this.heroImagePath = heroImagePath;
    }

    public String getAvatarPath() {
        return avatarPath;
    }

    public void setAvatarPath(String avatarPath) {
        this.avatarPath = avatarPath;
    }

    public String getLogoPath() {
        return logoPath;
    }

    public void setLogoPath(String logoPath) {
        this.logoPath = logoPath;
    }

    public String getResumePath() {
        return resumePath;
    }

    public void setResumePath(String resumePath) {
        this.resumePath = resumePath;
    }

    public String getIcpNumber() {
        return icpNumber;
    }

    public void setIcpNumber(String icpNumber) {
        this.icpNumber = icpNumber;
    }

    public String getIcpUrl() {
        return icpUrl;
    }

    public void setIcpUrl(String icpUrl) {
        this.icpUrl = icpUrl;
    }

    public String getIcpIconPath() {
        return icpIconPath;
    }

    public void setIcpIconPath(String icpIconPath) {
        this.icpIconPath = icpIconPath;
    }

    public String getPoliceNumber() {
        return policeNumber;
    }

    public void setPoliceNumber(String policeNumber) {
        this.policeNumber = policeNumber;
    }

    public String getPoliceUrl() {
        return policeUrl;
    }

    public void setPoliceUrl(String policeUrl) {
        this.policeUrl = policeUrl;
    }

    public String getPoliceIconPath() {
        return policeIconPath;
    }

    public void setPoliceIconPath(String policeIconPath) {
        this.policeIconPath = policeIconPath;
    }

    public String getPrimaryCtaLabel() {
        return primaryCtaLabel;
    }

    public void setPrimaryCtaLabel(String primaryCtaLabel) {
        this.primaryCtaLabel = primaryCtaLabel;
    }

    public String getPrimaryCtaLink() {
        return primaryCtaLink;
    }

    public void setPrimaryCtaLink(String primaryCtaLink) {
        this.primaryCtaLink = primaryCtaLink;
    }

    public String getSecondaryCtaLabel() {
        return secondaryCtaLabel;
    }

    public void setSecondaryCtaLabel(String secondaryCtaLabel) {
        this.secondaryCtaLabel = secondaryCtaLabel;
    }

    public String getSecondaryCtaLink() {
        return secondaryCtaLink;
    }

    public void setSecondaryCtaLink(String secondaryCtaLink) {
        this.secondaryCtaLink = secondaryCtaLink;
    }
}
