package com.lumina.lms.controller;

import com.lumina.lms.model.Attendance;
import com.lumina.lms.model.Course;
import com.lumina.lms.model.User;
import com.lumina.lms.repository.AttendanceRepository;
import com.lumina.lms.repository.CourseRepository;
import com.lumina.lms.security.CustomUserDetails;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses/{courseId}/attendance")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final CourseRepository courseRepository;

    public AttendanceController(AttendanceRepository attendanceRepository, CourseRepository courseRepository) {
        this.attendanceRepository = attendanceRepository;
        this.courseRepository = courseRepository;
    }

    // Teacher fetching enrolled students & existing attendance for a specific date
    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceForDate(
            @PathVariable Long courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        Course course = courseRepository.findById(courseId).orElseThrow();
        List<Attendance> existingRecords = attendanceRepository.findByCourseIdAndDate(courseId, date);
        
        List<Map<String, Object>> response = course.getEnrolledStudents().stream().map(student -> {
            Map<String, Object> map = new HashMap<>();
            map.put("studentId", student.getId());
            map.put("studentName", student.getName());
            map.put("studentEmail", student.getEmail());
            
            Optional<Attendance> existing = existingRecords.stream()
                .filter(a -> a.getStudent().getId().equals(student.getId()))
                .findFirst();
                
            map.put("status", existing.isPresent() ? existing.get().getStatus() : "");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Teacher saving attendance for a specific date
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> saveAttendance(
            @PathVariable Long courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody Map<Long, String> attendanceData) { // Map of studentId -> status

        Course course = courseRepository.findById(courseId).orElseThrow();
        
        List<User> enrolled = course.getEnrolledStudents();
        for (User student : enrolled) {
            String status = attendanceData.get(student.getId());
            if (status != null && !status.isEmpty()) {
                Optional<Attendance> existingOpt = attendanceRepository.findByCourseAndStudentAndDate(course, student, date);
                if (existingOpt.isPresent()) {
                    Attendance att = existingOpt.get();
                    att.setStatus(status);
                    attendanceRepository.save(att);
                } else {
                    Attendance att = Attendance.builder()
                        .course(course)
                        .student(student)
                        .date(date)
                        .status(status)
                        .build();
                    attendanceRepository.save(att);
                }
            }
        }
        return ResponseEntity.ok(Map.of("message", "Attendance saved successfully"));
    }

    // Student checking their own attendance for a course
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getMyAttendance(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        List<Attendance> records = attendanceRepository.findByStudentIdAndCourseId(userDetails.getId(), courseId);
        
        List<Map<String, Object>> response = records.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", a.getDate());
            map.put("status", a.getStatus());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
