package com.lumina.lms.controller;

import com.lumina.lms.model.Course;
import com.lumina.lms.model.User;
import com.lumina.lms.repository.CourseRepository;
import com.lumina.lms.repository.UserRepository;
import com.lumina.lms.security.CustomUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseController(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll().stream().map(this::mapCourse).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourse(@PathVariable Long id) {
        return courseRepository.findById(id).map(c -> ResponseEntity.ok(mapCourse(c))).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/enrolled")
    public ResponseEntity<List<Map<String, Object>>> getEnrolledCourses(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(courseRepository.findEnrolledCourses(user.getId()).stream().map(this::mapCourse).collect(Collectors.toList()));
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> getTeacherCourses(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User teacher = userRepository.findById(userDetails.getId()).orElseThrow();
        return ResponseEntity.ok(courseRepository.findByTeacher(teacher).stream().map(this::mapCourse).collect(Collectors.toList()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> createCourse(@RequestBody Map<String, String> request,
                                           @AuthenticationPrincipal CustomUserDetails userDetails) {
        User teacher = userRepository.findById(userDetails.getId()).orElseThrow();
        Course course = Course.builder()
                .title(request.get("title"))
                .description(request.get("description"))
                .teacher(teacher)
                .status(request.getOrDefault("status", "active"))
                .build();
        course = courseRepository.save(course);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapCourse(course));
    }

    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> enrollInCourse(@PathVariable Long courseId,
                                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        User student = userRepository.findById(userDetails.getId()).orElseThrow();
        if (course.getEnrolledStudents() != null && course.getEnrolledStudents().contains(student)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Already enrolled"));
        }
        course.getEnrolledStudents().add(student);
        courseRepository.save(course);
        return ResponseEntity.ok(Map.of("message", "Enrolled successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Course deleted"));
    }

    private Map<String, Object> mapCourse(Course course) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", course.getId());
        map.put("title", course.getTitle());
        map.put("description", course.getDescription());
        map.put("status", course.getStatus());
        map.put("coverImageUrl", course.getCoverImageUrl());
        map.put("instructor", course.getTeacher() != null ? course.getTeacher().getName() : null);
        map.put("teacherId", course.getTeacher() != null ? course.getTeacher().getId() : null);
        map.put("enrolledCount", course.getEnrolledStudents() != null ? course.getEnrolledStudents().size() : 0);
        
        List<Map<String, String>> enrolledStudentsList = new ArrayList<>();
        if (course.getEnrolledStudents() != null) {
            for (User u : course.getEnrolledStudents()) {
                Map<String, String> s = new HashMap<>();
                s.put("name", u.getName());
                s.put("email", u.getEmail());
                enrolledStudentsList.add(s);
            }
        }
        map.put("enrolledStudents", enrolledStudentsList);
        
        map.put("createdAt", course.getCreatedAt());
        return map;
    }
}
