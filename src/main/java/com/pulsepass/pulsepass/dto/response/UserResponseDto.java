package com.pulsepass.pulsepass.dto.response;

public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private Boolean active;
    private UserProfileResponseDto profile;

    public UserResponseDto() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public UserProfileResponseDto getProfile() { return profile; }
    public void setProfile(UserProfileResponseDto profile) { this.profile = profile; }
}