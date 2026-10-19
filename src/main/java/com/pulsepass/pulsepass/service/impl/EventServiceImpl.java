package com.pulsepass.pulsepass.service.impl;

import com.pulsepass.pulsepass.domain.*;
import com.pulsepass.pulsepass.dto.response.EventResponseDto;
import com.pulsepass.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.EventMapper;
import com.pulsepass.pulsepass.repository.ArtistRepository;
import com.pulsepass.pulsepass.repository.EventRepository;
import com.pulsepass.pulsepass.repository.VenueRepository;
import com.pulsepass.pulsepass.service.EventService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ArtistRepository artistRepository;
    private final EventMapper eventMapper;

    public EventServiceImpl(EventRepository eventRepository, VenueRepository venueRepository,
                            ArtistRepository artistRepository, EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.artistRepository = artistRepository;
        this.eventMapper = eventMapper;
    }

    @Override
    @Transactional
    public EventResponseDto create(CreateEventRequest request) {
        // BR-EVENT-001: Código único
        if (eventRepository.existsByEventCode(request.eventCode())) {
            throw new DuplicateResourceException("Ya existe un evento con el código: " + request.eventCode());
        }

        // BR-EVENT-002: Venue obligatorio y existente
        Venue venue = venueRepository.findByCode(request.venueCode())
                .orElseThrow(() -> new ResourceNotFoundException("Venue no encontrado con código: " + request.venueCode()));

        // BR-EVENT-003: Venue activo
        if (!venue.getActive()) {
            throw new BusinessRuleException("No se puede crear un evento en un recinto (venue) inactivo.");
        }

        // BR-EVENT-004: Fecha futura
        if (request.eventDate() == null || request.eventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("La fecha del evento debe ser una fecha futura.");
        }

        // BR-EVENT-006: Edad mínima >= 0
        if (request.minimumAge() != null && request.minimumAge() < 0) {
            throw new BusinessRuleException("La edad mínima no puede ser negativa.");
        }

        // BR-EVENT-005: Estado inicial DRAFT
        Event event = new Event(
                request.eventCode(),
                request.name(),
                request.description(),
                request.category(),
                EventStatus.DRAFT,
                request.eventDate(),
                request.minimumAge() != null ? request.minimumAge() : 0,
                venue
        );

        Event savedEvent = eventRepository.save(event);
        return eventMapper.toDto(savedEvent);
    }

    @Override
    public EventResponseDto findByCode(String eventCode) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado: " + eventCode));
        return eventMapper.toDto(event);
    }

    @Override
    public List<EventResponseDto> findPublishedEvents() {
        return eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED)
                .stream()
                .map(eventMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public EventResponseDto publish(String eventCode) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado: " + eventCode));

        // BR-EVENT-007: Solo se puede publicar si está en DRAFT
        if (event.getStatus() != EventStatus.DRAFT) {
            throw new BusinessRuleException("Solo se pueden publicar eventos en estado DRAFT. Estado actual: " + event.getStatus());
        }

        // BR-EVENT-008: Fecha futura
        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("No se puede publicar un evento cuya fecha ya ha expirado.");
        }

        // BR-EVENT-009: Venue activo
        if (!event.getVenue().getActive()) {
            throw new BusinessRuleException("No se puede publicar un evento cuyo recinto se encuentra inactivo.");
        }

        event.setStatus(EventStatus.PUBLISHED);
        return eventMapper.toDto(event);
    }

    @Override
    @Transactional
    public EventResponseDto addArtist(String eventCode, Long artistId) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado: " + eventCode));

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("Artista no encontrado con ID: " + artistId));

        // BR-EVENT-011: No se pueden agregar artistas a eventos CANCELLED o FINISHED
        if (event.getStatus() == EventStatus.CANCELLED || event.getStatus() == EventStatus.FINISHED) {
            throw new BusinessRuleException("No se pueden asociar artistas a un evento cancelado o finalizado.");
        }

        // BR-EVENT-010: Evitar duplicados de artista en el evento
        if (event.getArtists().contains(artist)) {
            throw new BusinessRuleException("El artista ya se encuentra asociado a este evento.");
        }

        event.addArtist(artist);
        return eventMapper.toDto(event);
    }

    @Override
    public List<EventResponseDto> findByArtist(String stageName) {
        return eventRepository.findByArtistStageName(stageName)
                .stream()
                .map(eventMapper::toDto)
                .toList();
    }

    @Override
    public List<EventResponseDto> findPublishedByArtist(String stageName) {
        return eventRepository
                .findByArtistStageNameAndStatus(stageName, EventStatus.PUBLISHED)
                .stream()
                .map(eventMapper::toDto)
                .toList();
    }
}