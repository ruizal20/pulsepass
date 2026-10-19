package com.pulsepass.pulsepass.dto.response;

import com.pulsepass.pulsepass.domain.TicketStatus;
import com.pulsepass.pulsepass.domain.TicketType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TicketResponseDto(
        Long id,
        String ticketCode,
        TicketType type,
        BigDecimal price,
        TicketStatus status,
        LocalDateTime purchaseDate,
        EventResponseDto event
) {}