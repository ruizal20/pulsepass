package com.pulsepass.pulsepass.service.impl;

import com.pulsepass.pulsepass.domain.*;
import com.pulsepass.pulsepass.dto.response.TicketResponseDto;
import com.pulsepass.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.TicketMapper;
import com.pulsepass.pulsepass.repository.EventRepository;
import com.pulsepass.pulsepass.repository.TicketRepository;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.service.TicketService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketMapper ticketMapper;

    public TicketServiceImpl(TicketRepository ticketRepository, UserRepository userRepository,
                             EventRepository eventRepository, TicketMapper ticketMapper) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.ticketMapper = ticketMapper;
    }

    @Override
    @Transactional
    public TicketResponseDto purchase(PurchaseTicketRequest request) {
        // BR-TICKET-001: Buscar usuario por email
        User user = userRepository.findByEmail(request.userEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + request.userEmail()));

        // BR-TICKET-002: Usuario activo
        if (!user.getActive()) {
            throw new BusinessRuleException("Un usuario inactivo no puede comprar entradas.");
        }

        // BR-TICKET-003: Buscar evento
        Event event = eventRepository.findByEventCode(request.eventCode())
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado con código: " + request.eventCode()));

        // BR-TICKET-004: Evento publicado
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessRuleException("Solo se pueden comprar tickets para eventos publicados. Estado actual: " + event.getStatus());
        }

        // BR-TICKET-005: Fecha futura del evento
        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("No se puede comprar entradas para un evento que ya ocurrió.");
        }

        // BR-TICKET-006: Validación de edad mínima
        if (event.getMinimumAge() > 0 && user.getUserProfile() != null && user.getUserProfile().getBirthDate() != null) {
            int age = Period.between(user.getUserProfile().getBirthDate(), event.getEventDate().toLocalDate()).getYears();
            if (age < event.getMinimumAge()) {
                throw new BusinessRuleException("El usuario no cumple con la edad mínima requerida (" + event.getMinimumAge() + " años) para este evento.");
            }
        }

        // BR-TICKET-007 y Capacidad: Contar tickets pagados actuales
        long paidTicketsCount = ticketRepository.countPaidTicketsByEventCode(event.getEventCode());
        int venueCapacity = event.getVenue().getCapacity();

        if (paidTicketsCount >= venueCapacity) {
            throw new BusinessRuleException("Lo sentimos, el evento se encuentra agotado (SOLD_OUT).");
        }

        // BR-TICKET-009: Cálculo de precio seguro en el backend usando BigDecimal
        BigDecimal basePrice = switch (request.type()) {
            case GENERAL -> BigDecimal.valueOf(50000);
            case VIP -> BigDecimal.valueOf(120000);
            case BACKSTAGE -> BigDecimal.valueOf(250000);
            case STUDENT -> BigDecimal.valueOf(35000);
        };

        if (basePrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("El precio del ticket no puede ser negativo.");
        }

        // Crear ticket con estado inicial PAID
        String uniqueCode = "TCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Ticket ticket = new Ticket(
                uniqueCode,
                request.type(),
                basePrice,
                TicketStatus.PAID,
                LocalDateTime.now(),
                user,
                event
        );

        Ticket savedTicket = ticketRepository.save(ticket);

        // BR-TICKET-008: Si esta compra completa la capacidad, cambiar el evento a SOLD_OUT
        if (paidTicketsCount + 1 >= venueCapacity) {
            event.setStatus(EventStatus.SOLD_OUT);
            eventRepository.save(event);
        }

        return ticketMapper.toDto(savedTicket);
    }

    @Override
    public TicketResponseDto findByCode(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado con código: " + ticketCode));
        return ticketMapper.toDto(ticket);
    }

    @Override
    public List<TicketResponseDto> findByUserEmail(String email) {
        return ticketRepository.findByUserEmail(email)
                .stream()
                .map(ticketMapper::toDto)
                .toList();
    }

    @Override
    public List<TicketResponseDto> findPaidTicketsByEvent(String eventCode) {
        return ticketRepository.findByEventCodeAndStatus(eventCode, TicketStatus.PAID)
                .stream()
                .map(ticketMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public TicketResponseDto cancel(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado con código: " + ticketCode));

        // BR-TICKET-010 y BR-TICKET-011: Solo se puede cancelar si está PAID
        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Solo se pueden cancelar tickets con estado PAID. Estado actual: " + ticket.getStatus());
        }

        // BR-TICKET-012: No se puede cancelar después de la fecha del evento
        if (ticket.getEvent().getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("No se puede cancelar un ticket de un evento que ya ocurrió.");
        }

        ticket.setStatus(TicketStatus.CANCELLED);
        return ticketMapper.toDto(ticket);
    }

    @Override
    @Transactional
    public TicketResponseDto markAsUsed(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado con código: " + ticketCode));

        // BR-TICKET-013 y BR-TICKET-014: Solo se puede marcar como usado si está PAID
        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Solo se puede marcar como usado un ticket PAID. Estado actual: " + ticket.getStatus());
        }

        ticket.setStatus(TicketStatus.USED);
        return ticketMapper.toDto(ticket);
    }
}
