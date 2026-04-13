package com.lumina.lms.controller;

import com.lumina.lms.dto.AuthResponse;
import com.lumina.lms.dto.LoginRequest;
import com.lumina.lms.dto.RegisterRequest;
import com.lumina.lms.model.User;
import com.lumina.lms.repository.UserRepository;
import com.lumina.lms.security.CustomUserDetails;
import com.lumina.lms.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            String trimmedEmail = request.getEmail().trim();
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(trimmedEmail, request.getPassword()));
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            // Check if user is active
            User user = userRepository.findById(userDetails.getId()).orElse(null);
            if (user != null && !user.isActive()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Account is deactivated. Please contact support."));
            }

            String token = tokenProvider.generateToken(authentication);

            return ResponseEntity.ok(AuthResponse.builder()
                    .token(token)
                    .user(AuthResponse.UserDto.builder()
                            .id(userDetails.getId())
                            .name(userDetails.getName())
                            .email(userDetails.getUsername())
                            .role(userDetails.getRole())
                            .build())
                    .build());
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        } catch (Exception e) {
            e.printStackTrace(); // Log for server-side debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error during login: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String trimmedEmail = request.getEmail().trim();
        if (userRepository.existsByEmail(trimmedEmail)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role. Must be ADMIN, TEACHER, or STUDENT"));
        }

        User user = User.builder()
                .name(request.getName())
                .email(trimmedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateTokenForUser(
                user.getId(), user.getRole().name(), user.getName(), user.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED).body(AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .build())
                .build());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email") != null ? request.get("email").trim() : "";
        String newPassword = request.get("newPassword");
        
        if (email.isEmpty() || newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Valid email and new password (min. 8 characters) are required"));
        }
        
        return userRepository.findByEmail(email)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "Password reset successfully! You can now login with your new password."));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No account found with this email address.")));
    }
}
