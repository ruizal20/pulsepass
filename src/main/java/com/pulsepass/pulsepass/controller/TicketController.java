package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.pulsepass.dto.response.TicketResponseDto;
import com.pulsepass.pulsepass.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @PreAuthorize("@authorizationService.canPurchaseTicket(#p0, authentication)")
    public ResponseEntity<TicketResponseDto> purchase(
            @Valid @RequestBody PurchaseTicketRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.purchase(request));
    }

    @GetMapping("/{ticketCode}")
    @PreAuthorize("@authorizationService.canAccessTicket(#p0, authentication)")
    public ResponseEntity<TicketResponseDto> getByCode(
            @PathVariable String ticketCode
    ) {
        return ResponseEntity.ok(ticketService.findByCode(ticketCode));
    }

    @GetMapping("/by-user")
    @PreAuthorize("@authorizationService.canAccessUserTickets(#p0, authentication)")
    public ResponseEntity<List<TicketResponseDto>> getByUserEmail(
            @RequestParam String email
    ) {
        return ResponseEntity.ok(ticketService.findByUserEmail(email));
    }

    @PatchMapping("/{ticketCode}/cancel")
    @PreAuthorize("@authorizationService.canCancelTicket(#p0, authentication)")
    public ResponseEntity<TicketResponseDto> cancel(
            @PathVariable String ticketCode
    ) {
        return ResponseEntity.ok(ticketService.cancel(ticketCode));
    }

    @PatchMapping("/{ticketCode}/use")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<TicketResponseDto> markAsUsed(
            @PathVariable String ticketCode
    ) {
        return ResponseEntity.ok(ticketService.markAsUsed(ticketCode));
    }
}