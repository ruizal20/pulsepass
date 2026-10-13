
package com.pulsepass.pulsepass.dto.response;

public record ArtistResponseDto(
        Long id,
        String stageName,
        String biography,
        String musicalGenre
) {}