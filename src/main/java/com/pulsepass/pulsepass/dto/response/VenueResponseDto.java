
package com.pulsepass.pulsepass.dto.response;

public record VenueResponseDto(
        Long id,
        String code,
        String name,
        String city,
        String address,
        Integer capacity,
        Boolean active
) {}