package com.lumina.lms.controller;

import com.lumina.lms.model.Assignment;
import com.lumina.lms.model.Course;
import com.lumina.lms.model.Submission;
import com.lumina.lms.model.User;
import com.lumina.lms.repository.AssignmentRepository;
import com.lumina.lms.repository.CourseRepository;
import com.lumina.lms.repository.SubmissionRepository;
import com.lumina.lms.repository.UserRepository;
import com.lumina.lms.security.CustomUserDetails;
import com.lumina.lms.service.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public AssignmentController(AssignmentRepository assignmentRepository, CourseRepository courseRepository,
                                SubmissionRepository submissionRepository, UserRepository userRepository,
                                CloudinaryService cloudinaryService) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping("/courses/{courseId}/assignments")
    public ResponseEntity<List<Map<String, Object>>> getAssignments(@PathVariable Long courseId) {
        List<Map<String, Object>> assignments = assignmentRepository.findByCourseId(courseId).stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", a.getId());
                    map.put("title", a.getTitle());
                    map.put("description", a.getDescription());
                    map.put("dueDate", a.getDueDate());
                    map.put("maxMarks", a.getMaxMarks());
                    map.put("questionPaperUrl", a.getFileUrl());
                    map.put("submissionCount", a.getSubmissions() != null ? a.getSubmissions().size() : 0);
                    map.put("createdAt", a.getCreatedAt());
                    return map;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(assignments);
    }

    @PostMapping("/courses/{courseId}/assignments")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> createAssignment(@PathVariable Long courseId,
                                               @RequestParam("title") String title,
                                               @RequestParam(value = "description", required = false) String description,
                                               @RequestParam(value = "dueDate", required = false) String dueDate,
                                               @RequestParam(value = "maxMarks", required = false) Integer maxMarks,
                                               @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            
            Assignment a = new Assignment();
            a.setTitle(title);
            a.setDescription(description);
            if (dueDate != null && !dueDate.isEmpty()) {
                a.setDueDate(LocalDateTime.parse(dueDate));
            }
            a.setMaxMarks(maxMarks != null ? maxMarks : 100);
            a.setCourse(course);

            if (file != null && !file.isEmpty()) {
                Map<String, Object> uploadResult = cloudinaryService.upload(file, "assignments");
                a.setFileUrl((String) uploadResult.get("secure_url"));
                a.setCloudinaryPublicId((String) uploadResult.get("public_id"));
            }

            a = assignmentRepository.save(a);

            Map<String, Object> response = new HashMap<>();
            response.put("id", a.getId());
            response.put("title", a.getTitle());
            response.put("fileUrl", a.getFileUrl());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create assignment: " + e.getMessage()));
        }
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitAssignment(@PathVariable Long assignmentId,
                                               @RequestParam(value = "file", required = false) MultipartFile file,
                                               @RequestParam(value = "textContent", required = false) String textContent,
                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment not found"));
            User student = userRepository.findById(userDetails.getId()).orElseThrow();

            // Try to find an existing submission first
            Submission s = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId())
                    .orElseGet(() -> {
                        Submission newSub = new Submission();
                        newSub.setAssignment(assignment);
                        newSub.setStudent(student);
                        return newSub;
                    });

            if ("graded".equals(s.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Cannot update a graded submission"));
            }

            s.setTextContent(textContent);
            s.setStatus("submitted");
            s.setSubmittedAt(LocalDateTime.now());

            if (file != null && !file.isEmpty()) {
                Map<String, Object> uploadResult = cloudinaryService.upload(file, "submissions");
                s.setFileUrl((String) uploadResult.get("secure_url"));
                s.setCloudinaryPublicId((String) uploadResult.get("public_id"));
            }

            s = submissionRepository.save(s);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "id", s.getId(), "status", s.getStatus(), "message", "Submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Submission failed: " + e.getMessage()));
        }
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getSubmissions(@PathVariable Long assignmentId) {
        List<Map<String, Object>> subs = submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getId());
                    map.put("studentName", s.getStudent().getName());
                    map.put("studentEmail", s.getStudent().getEmail());
                    map.put("submissionFileUrl", s.getFileUrl());
                    map.put("textContent", s.getTextContent());
                    map.put("grade", s.getGrade());
                    map.put("feedback", s.getFeedback());
                    map.put("status", s.getStatus());
                    map.put("submittedAt", s.getSubmittedAt());
                    return map;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(subs);
    }

    @PutMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> gradeSubmission(@PathVariable Long submissionId, @RequestBody Map<String, Object> request) {
        Submission s = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        if (request.get("grade") != null) s.setGrade(((Number) request.get("grade")).intValue());
        if (request.get("feedback") != null) s.setFeedback((String) request.get("feedback"));
        s.setStatus("graded");
        s.setGradedAt(LocalDateTime.now());
        submissionRepository.save(s);
        return ResponseEntity.ok(Map.of("message", "Graded successfully"));
    }

    @GetMapping("/assignments/student/graded")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getStudentGradedAssignments(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Map<String, Object>> subs = submissionRepository.findByStudentIdAndStatus(userDetails.getId(), "graded").stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getId());
                    map.put("assignmentTitle", s.getAssignment().getTitle());
                    map.put("courseName", s.getAssignment().getCourse().getTitle());
                    map.put("grade", s.getGrade());
                    map.put("maxMarks", s.getAssignment().getMaxMarks());
                    map.put("feedback", s.getFeedback());
                    map.put("submittedAt", s.getSubmittedAt());
                    map.put("gradedAt", s.getGradedAt());
                    return map;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(subs);
    }

    @GetMapping("/assignments/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getStudentAssignments(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Map<String, Object>> subs = submissionRepository.findByStudentId(userDetails.getId()).stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getId());
                    map.put("assignmentId", s.getAssignment().getId());
                    map.put("assignmentTitle", s.getAssignment().getTitle());
                    map.put("assignmentDescription", s.getAssignment().getDescription());
                    map.put("questionPaperUrl", s.getAssignment().getFileUrl());
                    map.put("courseName", s.getAssignment().getCourse().getTitle());
                    map.put("grade", s.getGrade());
                    map.put("maxMarks", s.getAssignment().getMaxMarks());
                    map.put("status", s.getStatus());
                    map.put("submittedAt", s.getSubmittedAt());
                    map.put("feedback", s.getFeedback());
                    map.put("submissionFileUrl", s.getFileUrl());
                    map.put("textContent", s.getTextContent());
                    return map;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(subs);
    }

    @GetMapping("/assignments/teacher/submissions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getTeacherSubmissions(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Map<String, Object>> subs = submissionRepository.findByAssignmentCourseTeacherId(userDetails.getId()).stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getId());
                    map.put("assignmentTitle", s.getAssignment().getTitle());
                    map.put("courseName", s.getAssignment().getCourse().getTitle());
                    map.put("studentName", s.getStudent().getName());
                    map.put("studentEmail", s.getStudent().getEmail());
                    map.put("submissionFileUrl", s.getFileUrl());
                    map.put("textContent", s.getTextContent());
                    map.put("grade", s.getGrade());
                    map.put("feedback", s.getFeedback());
                    map.put("status", s.getStatus());
                    map.put("submittedAt", s.getSubmittedAt());
                    map.put("maxMarks", s.getAssignment().getMaxMarks());
                    return map;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(subs);
    }
}
