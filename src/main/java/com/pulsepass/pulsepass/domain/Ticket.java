package com.pulsepass.pulsepass.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_code", nullable = false, unique = true, length = 50)
    private String ticketCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private TicketType type;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private TicketStatus status;

    @Column(name = "purchase_date", nullable = false)
    private LocalDateTime purchaseDate;

    // Relación N:1 con User (Muchos tickets pertenecen a un usuario)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Relación N:1 con Event (Muchos tickets pertenecen a un evento)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    // Constructor vacío obligatorio para JPA
    protected Ticket() {
    }

    public Ticket(String ticketCode, TicketType type, BigDecimal price, TicketStatus status, 
                  LocalDateTime purchaseDate, User user, Event event) {
        this.ticketCode = ticketCode;
        this.type = type;
        this.price = price;
        this.status = status;
        this.purchaseDate = purchaseDate;
        this.user = user;
        this.event = event;
    }

    // Getters
    public Long getId() { return id; }
    public String getTicketCode() { return ticketCode; }
    public TicketType getType() { return type; }
    public BigDecimal getPrice() { return price; }
    public TicketStatus getStatus() { return status; }
    public LocalDateTime getPurchaseDate() { return purchaseDate; }
    public User getUser() { return user; }
    public Event getEvent() { return event; }
}