package com.lumina.lms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(nullable = false)
    private String status = "active";

    @ManyToMany
    @JoinTable(name = "enrollments",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id"))
    private List<User> enrolledStudents = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Material> materials = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Assignment> assignments = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Course() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<User> getEnrolledStudents() { return enrolledStudents; }
    public void setEnrolledStudents(List<User> enrolledStudents) { this.enrolledStudents = enrolledStudents; }
    public List<Material> getMaterials() { return materials; }
    public void setMaterials(List<Material> materials) { this.materials = materials; }
    public List<Assignment> getAssignments() { return assignments; }
    public void setAssignments(List<Assignment> assignments) { this.assignments = assignments; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static CourseBuilder builder() { return new CourseBuilder(); }

    public static class CourseBuilder {
        private String title, description, coverImageUrl, status = "active";
        private User teacher;

        public CourseBuilder title(String t) { this.title = t; return this; }
        public CourseBuilder description(String d) { this.description = d; return this; }
        public CourseBuilder teacher(User t) { this.teacher = t; return this; }
        public CourseBuilder coverImageUrl(String u) { this.coverImageUrl = u; return this; }
        public CourseBuilder status(String s) { this.status = s; return this; }

        public Course build() {
            Course c = new Course();
            c.title = this.title; c.description = this.description;
            c.teacher = this.teacher; c.coverImageUrl = this.coverImageUrl;
            c.status = this.status;
            return c;
        }
    }
}
