package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.domain.UserRole;
import com.pulsepass.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.pulsepass.dto.response.EventResponseDto;
import com.pulsepass.pulsepass.dto.response.TicketResponseDto;
import com.pulsepass.pulsepass.security.SecurityPrincipal;
import com.pulsepass.pulsepass.service.EventService;
import com.pulsepass.pulsepass.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final TicketService ticketService;

    public EventController(
            EventService eventService,
            TicketService ticketService
    ) {
        this.eventService = eventService;
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<EventResponseDto> create(
            @Valid @RequestBody CreateEventRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.create(request));
    }

    @GetMapping("/{eventCode}")
    @PreAuthorize("@authorizationService.canViewEvent(#p0, authentication)")
    public ResponseEntity<EventResponseDto> getByCode(
            @PathVariable String eventCode
    ) {
        return ResponseEntity.ok(eventService.findByCode(eventCode));
    }

    @GetMapping("/published")
    public ResponseEntity<List<EventResponseDto>> getPublishedEvents() {
        return ResponseEntity.ok(eventService.findPublishedEvents());
    }

    @PatchMapping("/{eventCode}/publish")
    public ResponseEntity<EventResponseDto> publish(
            @PathVariable String eventCode
    ) {
        return ResponseEntity.ok(eventService.publish(eventCode));
    }

    @PostMapping("/{eventCode}/artists/{artistId}")
    public ResponseEntity<EventResponseDto> addArtist(
            @PathVariable String eventCode,
            @PathVariable Long artistId
    ) {
        return ResponseEntity.ok(eventService.addArtist(eventCode, artistId));
    }

    @GetMapping("/by-artist")
    public ResponseEntity<List<EventResponseDto>> getByArtist(
            @RequestParam String stageName,
            @AuthenticationPrincipal SecurityPrincipal principal
    ) {
        if (principal != null
                && (principal.getRole() == UserRole.STAFF
                    || principal.getRole() == UserRole.ADMIN)) {
            return ResponseEntity.ok(eventService.findByArtist(stageName));
        }

        return ResponseEntity.ok(eventService.findPublishedByArtist(stageName));
    }

    @GetMapping("/{eventCode}/tickets/paid")
    public ResponseEntity<List<TicketResponseDto>> getPaidTicketsByEvent(
            @PathVariable String eventCode
    ) {
        return ResponseEntity.ok(
                ticketService.findPaidTicketsByEvent(eventCode)
        );
    }
}