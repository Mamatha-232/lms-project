package com.lumina.lms.controller;

import com.lumina.lms.model.Material;
import com.lumina.lms.model.Course;
import com.lumina.lms.model.User;
import com.lumina.lms.repository.MaterialRepository;
import com.lumina.lms.repository.CourseRepository;
import com.lumina.lms.repository.UserRepository;
import com.lumina.lms.security.CustomUserDetails;
import com.lumina.lms.service.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class MaterialController {

    private final MaterialRepository materialRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public MaterialController(MaterialRepository materialRepository, CourseRepository courseRepository,
                              UserRepository userRepository, CloudinaryService cloudinaryService) {
        this.materialRepository = materialRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping("/courses/{courseId}/materials")
    public ResponseEntity<List<Map<String, Object>>> getMaterials(@PathVariable Long courseId) {
        List<Map<String, Object>> materials = materialRepository.findByCourseId(courseId).stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", m.getId());
                    map.put("title", m.getTitle());
                    map.put("fileUrl", m.getFileUrl());
                    map.put("fileType", m.getFileType());
                    map.put("fileSize", m.getFileSize());
                    map.put("createdAt", m.getCreatedAt());
                    return map;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(materials);
    }

    @PostMapping("/courses/{courseId}/materials")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> uploadMaterial(
            @PathVariable Long courseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            User uploader = userRepository.findById(userDetails.getId()).orElseThrow();

            Map<String, Object> uploadResult = cloudinaryService.upload(file, "materials");

            Material material = Material.builder()
                    .title(title)
                    .fileUrl((String) uploadResult.get("secure_url"))
                    .cloudinaryPublicId((String) uploadResult.get("public_id"))
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .course(course)
                    .uploadedBy(uploader)
                    .build();

            material = materialRepository.save(material);

            Map<String, Object> response = new HashMap<>();
            response.put("id", material.getId());
            response.put("title", material.getTitle());
            response.put("fileUrl", material.getFileUrl());
            response.put("fileType", material.getFileType());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }

    @DeleteMapping("/materials/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long id) {
        try {
            Material material = materialRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Material not found"));
            if (material.getCloudinaryPublicId() != null) {
                cloudinaryService.delete(material.getCloudinaryPublicId());
            }
            materialRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Material deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Delete failed: " + e.getMessage()));
        }
    }
}
