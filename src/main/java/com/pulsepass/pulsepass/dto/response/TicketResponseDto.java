package com.pulsepass.pulsepass.dto.response;

import com.pulsepass.pulsepass.domain.TicketStatus;
import com.pulsepass.pulsepass.domain.TicketType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TicketResponseDto {
    private Long id;
    private String ticketCode;
    private TicketType type;
    private BigDecimal price;
    private TicketStatus status;
    private LocalDateTime purchaseDate;
    private EventResponseDto event;

    public TicketResponseDto() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTicketCode() { return ticketCode; }
    public void setTicketCode(String ticketCode) { this.ticketCode = ticketCode; }

    public TicketType getType() { return type; }
    public void setType(TicketType type) { this.type = type; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public LocalDateTime getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDateTime purchaseDate) { this.purchaseDate = purchaseDate; }

    public EventResponseDto getEvent() { return event; }
    public void setEvent(EventResponseDto event) { this.event = event; }
}