package com.lumina.lms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "materials")
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "cloudinary_public_id")
    private String cloudinaryPublicId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Material() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getCloudinaryPublicId() { return cloudinaryPublicId; }
    public void setCloudinaryPublicId(String cloudinaryPublicId) { this.cloudinaryPublicId = cloudinaryPublicId; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static MaterialBuilder builder() { return new MaterialBuilder(); }

    public static class MaterialBuilder {
        private String title, fileUrl, fileType, cloudinaryPublicId;
        private Long fileSize;
        private Course course;
        private User uploadedBy;

        public MaterialBuilder title(String t) { this.title = t; return this; }
        public MaterialBuilder fileUrl(String u) { this.fileUrl = u; return this; }
        public MaterialBuilder fileType(String t) { this.fileType = t; return this; }
        public MaterialBuilder fileSize(Long s) { this.fileSize = s; return this; }
        public MaterialBuilder cloudinaryPublicId(String id) { this.cloudinaryPublicId = id; return this; }
        public MaterialBuilder course(Course c) { this.course = c; return this; }
        public MaterialBuilder uploadedBy(User u) { this.uploadedBy = u; return this; }

        public Material build() {
            Material m = new Material();
            m.title = this.title; m.fileUrl = this.fileUrl; m.fileType = this.fileType;
            m.fileSize = this.fileSize; m.cloudinaryPublicId = this.cloudinaryPublicId;
            m.course = this.course; m.uploadedBy = this.uploadedBy;
            return m;
        }
    }
}
