
package com.pulsepass.pulsepass.dto.response;

import com.pulsepass.pulsepass.domain.EventCategory;
import com.pulsepass.pulsepass.domain.EventStatus;
import java.time.LocalDateTime;
import java.util.List;

public record EventResponseDto(
        Long id,
        String eventCode,
        String title,
        String description,
        EventCategory category,
        EventStatus status,
        LocalDateTime eventDate,
        Integer minimumAge,
        String streamingUrl,
        VenueResponseDto venue,
        List<ArtistResponseDto> artists
) {}
