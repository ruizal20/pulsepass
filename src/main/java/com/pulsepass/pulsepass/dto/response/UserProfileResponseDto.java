package com.pulsepass.pulsepass.dto.response;

import java.time.LocalDate;

public record UserProfileResponseDto(
        Long id,
        String firstName,
        String lastName,
        String phone,
        String city,
        LocalDate birthDate
) {}