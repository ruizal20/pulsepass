package com.pulsepass.pulsepass.dto.response;

public record AuthenticatedUserResponse(
        Long id,
        String username,
        String email,
        String role
) {}