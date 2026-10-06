package com.pulsepass.pulsepass;

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
import com.pulsepass.pulsepass.service.impl.EventServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private EventMapper eventMapper;

    @InjectMocks
    private EventServiceImpl eventService;

    private Venue activeVenue;

    @BeforeEach
    void setUp() {
        activeVenue = new Venue("VEN-TST", "Test Venue", "Bogotá", "Calle 1", 1000, true);
    }

    @Test
    void shouldCreateEventSuccessfullyInDraftStatus() {
        // ARRANGE (TEST-EVENT-003)
        CreateEventRequest request = new CreateEventRequest(
                "EVT-NEW", "Festival 2026", "Musica",
                EventCategory.MUSIC, LocalDateTime.now().plusDays(10), 18, "VEN-TST"
        );

        when(eventRepository.existsByEventCode("EVT-NEW")).thenReturn(false);
        when(venueRepository.findByCode("VEN-TST")).thenReturn(Optional.of(activeVenue));
        
        Event savedEvent = new Event("EVT-NEW", "Festival 2026", "Musica", EventCategory.MUSIC, EventStatus.DRAFT, LocalDateTime.now().plusDays(10), 18, activeVenue);
        when(eventRepository.save(any(Event.class))).thenReturn(savedEvent);

        EventResponseDto responseDto = new EventResponseDto();
        responseDto.setEventCode("EVT-NEW");
        responseDto.setStatus(EventStatus.DRAFT);
        when(eventMapper.toDto(any(Event.class))).thenReturn(responseDto);

        // ACT
        EventResponseDto result = eventService.create(request);

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.getEventCode()).isEqualTo("EVT-NEW");
        assertThat(result.getStatus()).isEqualTo(EventStatus.DRAFT); // BR-EVENT-005
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void shouldThrowExceptionWhenVenueDoesNotExistOnEventCreation() {
        // ARRANGE (TEST-EVENT-004)
        CreateEventRequest request = new CreateEventRequest(
                "EVT-ERR", "Evento", "Desc",
                EventCategory.EDUCATION, LocalDateTime.now().plusDays(5), 0, "VEN-UNKNOWN"
        );

        when(eventRepository.existsByEventCode("EVT-ERR")).thenReturn(false);
        when(venueRepository.findByCode("VEN-UNKNOWN")).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Venue no encontrado");

        // Verificar que save() NUNCA se ejecutó
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void shouldPublishDraftEventSuccessfully() {
        // ARRANGE (TEST-EVENT-007)
        Event draftEvent = new Event("EVT-PUB", "Concierto", "Rock", EventCategory.MUSIC, EventStatus.DRAFT, LocalDateTime.now().plusDays(2), 14, activeVenue);

        when(eventRepository.findByEventCode("EVT-PUB")).thenReturn(Optional.of(draftEvent));

        EventResponseDto responseDto = new EventResponseDto();
        responseDto.setEventCode("EVT-PUB");
        responseDto.setStatus(EventStatus.PUBLISHED);
        when(eventMapper.toDto(any(Event.class))).thenReturn(responseDto);

        // ACT
        EventResponseDto result = eventService.publish("EVT-PUB");

        // ASSERT
        assertThat(result.getStatus()).isEqualTo(EventStatus.PUBLISHED);
    }
}