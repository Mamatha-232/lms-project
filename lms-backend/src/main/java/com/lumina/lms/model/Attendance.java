package com.lumina.lms.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "attendance")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String status; // PRESENT, ABSENT, LATE

    public Attendance() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static AttendanceBuilder builder() { return new AttendanceBuilder(); }

    public static class AttendanceBuilder {
        private Course course;
        private User student;
        private LocalDate date;
        private String status;

        public AttendanceBuilder course(Course c) { this.course = c; return this; }
        public AttendanceBuilder student(User s) { this.student = s; return this; }
        public AttendanceBuilder date(LocalDate d) { this.date = d; return this; }
        public AttendanceBuilder status(String s) { this.status = s; return this; }

        public Attendance build() {
            Attendance a = new Attendance();
            a.course = this.course;
            a.student = this.student;
            a.date = this.date;
            a.status = this.status;
            return a;
        }
    }
}
