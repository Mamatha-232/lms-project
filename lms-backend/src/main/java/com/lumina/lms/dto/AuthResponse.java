package com.lumina.lms.dto;

public class AuthResponse {
    private String token;
    private UserDto user;

    public AuthResponse() {}
    public AuthResponse(String token, UserDto user) { this.token = token; this.user = user; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public static AuthResponseBuilder builder() { return new AuthResponseBuilder(); }

    public static class AuthResponseBuilder {
        private String token;
        private UserDto user;
        public AuthResponseBuilder token(String t) { this.token = t; return this; }
        public AuthResponseBuilder user(UserDto u) { this.user = u; return this; }
        public AuthResponse build() { return new AuthResponse(token, user); }
    }

    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String avatarUrl;

        public UserDto() {}
        public UserDto(Long id, String name, String email, String role, String avatarUrl) {
            this.id = id; this.name = name; this.email = email; this.role = role; this.avatarUrl = avatarUrl;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

        public static UserDtoBuilder builder() { return new UserDtoBuilder(); }

        public static class UserDtoBuilder {
            private Long id;
            private String name, email, role, avatarUrl;
            public UserDtoBuilder id(Long id) { this.id = id; return this; }
            public UserDtoBuilder name(String n) { this.name = n; return this; }
            public UserDtoBuilder email(String e) { this.email = e; return this; }
            public UserDtoBuilder role(String r) { this.role = r; return this; }
            public UserDtoBuilder avatarUrl(String u) { this.avatarUrl = u; return this; }
            public UserDto build() { return new UserDto(id, name, email, role, avatarUrl); }
        }
    }
}
