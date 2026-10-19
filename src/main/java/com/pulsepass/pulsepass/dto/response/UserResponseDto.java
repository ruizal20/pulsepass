
package com.pulsepass.pulsepass.dto.response;

public record UserResponseDto(
        Long id,
        String username,
        String email,
        Boolean active,
        UserProfileResponseDto profile
) {}