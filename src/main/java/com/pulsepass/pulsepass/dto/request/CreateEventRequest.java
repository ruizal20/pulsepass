
package com.pulsepass.pulsepass.dto.request;

import com.pulsepass.pulsepass.domain.EventCategory;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record CreateEventRequest(
        @NotBlank(message = "Event code is required")
        @Size(max = 30, message = "Event code must not exceed 30 characters")
        String eventCode,

        @NotBlank(message = "Event name is required")
        @Size(max = 150, message = "Event name must not exceed 150 characters")
        String name,

        @NotBlank(message = "Description is required")
        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        @NotNull(message = "Category is required")
        EventCategory category,

        @NotNull(message = "Event date is required")
        @Future(message = "Event date must be in the future")
        LocalDateTime eventDate,

        @NotNull(message = "Minimum age is required")
        @Min(value = 0, message = "Minimum age cannot be negative")
        Integer minimumAge,

        @NotBlank(message = "Venue code is required")
        String venueCode
) {}