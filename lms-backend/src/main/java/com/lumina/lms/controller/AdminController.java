package com.lumina.lms.controller;

import com.lumina.lms.model.User;
import com.lumina.lms.repository.CourseRepository;
import com.lumina.lms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository, CourseRepository courseRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCourses", courseRepository.count());
        stats.put("totalStudents", userRepository.countByRole(User.Role.STUDENT));
        stats.put("totalTeachers", userRepository.countByRole(User.Role.TEACHER));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("name", u.getName());
                    map.put("email", u.getEmail());
                    map.put("role", u.getRole().name());
                    map.put("status", u.isActive() ? "active" : "inactive");
                    map.put("avatarUrl", u.getAvatarUrl());
                    map.put("createdAt", u.getCreatedAt());
                    return map;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> request) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (request.containsKey("name")) user.setName(request.get("name"));
        if (request.containsKey("email")) user.setEmail(request.get("email"));
        if (request.containsKey("role")) user.setRole(User.Role.valueOf(request.get("role")));
        if (request.containsKey("active")) user.setActive(Boolean.parseBoolean(request.get("active")));
        if (request.containsKey("password") && !request.get("password").isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.get("password")));
        }
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User updated"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }
}
