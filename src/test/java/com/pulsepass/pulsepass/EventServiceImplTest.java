
package com.pulsepass.pulsepass;

import com.pulsepass.pulsepass.domain.Artist;
import com.pulsepass.pulsepass.domain.Event;
import com.pulsepass.pulsepass.domain.EventCategory;
import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.domain.Venue;
import com.pulsepass.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.pulsepass.dto.response.EventResponseDto;
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
import java.util.List;
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
        activeVenue = new Venue(
                "VEN-TST",
                "Test Venue",
                "Bogotá",
                "Calle 1",
                1000,
                true
        );
    }

    private CreateEventRequest validRequest(String code, String venueCode) {
        return new CreateEventRequest(
                code,
                "Festival de prueba",
                "Descripción",
                EventCategory.MUSIC,
                LocalDateTime.now().plusDays(10),
                18,
                venueCode
        );
    }

    private EventResponseDto response(String code, EventStatus status) {
        return new EventResponseDto(
                1L,
                code,
                "Festival de prueba",
                "Descripción",
                EventCategory.MUSIC,
                status,
                LocalDateTime.now().plusDays(10),
                18,
                null,
                null,
                List.of()
        );
    }

    @Test
    void createShouldSaveEventWithDraftStatus() {
        CreateEventRequest request =
                validRequest("EVT-NEW", "VEN-TST");

        when(eventRepository.existsByEventCode("EVT-NEW"))
                .thenReturn(false);
        when(venueRepository.findByCode("VEN-TST"))
                .thenReturn(Optional.of(activeVenue));
        when(eventRepository.save(any(Event.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(eventMapper.toDto(any(Event.class)))
                .thenReturn(response("EVT-NEW", EventStatus.DRAFT));

        EventResponseDto result = eventService.create(request);

        assertThat(result.eventCode()).isEqualTo("EVT-NEW");
        assertThat(result.status()).isEqualTo(EventStatus.DRAFT);

        verify(eventRepository).save(argThat(event ->
                event.getStatus() == EventStatus.DRAFT
                && event.getVenue() == activeVenue
                && event.getMinimumAge() == 18
        ));
    }

    @Test
    void createShouldRejectDuplicateCode() {
        when(eventRepository.existsByEventCode("EVT-DUP"))
                .thenReturn(true);

        assertThatThrownBy(() ->
                eventService.create(validRequest("EVT-DUP", "VEN-TST"))
        )
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("EVT-DUP");

        verifyNoInteractions(venueRepository);
        verify(eventRepository, never()).save(any());
    }

    @Test
    void createShouldRejectMissingVenue() {
        when(eventRepository.existsByEventCode("EVT-ERR"))
                .thenReturn(false);
        when(venueRepository.findByCode("VEN-X"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                eventService.create(validRequest("EVT-ERR", "VEN-X"))
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Venue no encontrado");

        verify(eventRepository, never()).save(any());
    }

    @Test
    void createShouldRejectInactiveVenue() {
        Venue inactiveVenue = new Venue(
                "VEN-OFF",
                "Venue inactivo",
                "Bogotá",
                "Calle 2",
                100,
                false
        );

        when(eventRepository.existsByEventCode("EVT-OFF"))
                .thenReturn(false);
        when(venueRepository.findByCode("VEN-OFF"))
                .thenReturn(Optional.of(inactiveVenue));

        assertThatThrownBy(() ->
                eventService.create(validRequest("EVT-OFF", "VEN-OFF"))
        )
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("inactivo");

        verify(eventRepository, never()).save(any());
    }

    @Test
    void createShouldRejectPastDate() {
        when(eventRepository.existsByEventCode("EVT-PAST"))
                .thenReturn(false);
        when(venueRepository.findByCode("VEN-TST"))
                .thenReturn(Optional.of(activeVenue));

        CreateEventRequest request = new CreateEventRequest(
                "EVT-PAST",
                "Evento",
                "Descripción",
                EventCategory.MUSIC,
                LocalDateTime.now().minusDays(1),
                18,
                "VEN-TST"
        );

        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("fecha futura");

        verify(eventRepository, never()).save(any());
    }

    @Test
    void createShouldRejectNegativeMinimumAge() {
        when(eventRepository.existsByEventCode("EVT-AGE"))
                .thenReturn(false);
        when(venueRepository.findByCode("VEN-TST"))
                .thenReturn(Optional.of(activeVenue));

        CreateEventRequest request = new CreateEventRequest(
                "EVT-AGE",
                "Evento",
                "Descripción",
                EventCategory.MUSIC,
                LocalDateTime.now().plusDays(1),
                -1,
                "VEN-TST"
        );

        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("no puede ser negativa");

        verify(eventRepository, never()).save(any());
    }

    @Test
    void findByCodeShouldReturnEventDto() {
        Event event = new Event(
                "EVT-1",
                "Evento",
                "Descripción",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                LocalDateTime.now().plusDays(2),
                0,
                activeVenue
        );

        when(eventRepository.findByEventCode("EVT-1"))
                .thenReturn(Optional.of(event));

        EventResponseDto dto = response("EVT-1", EventStatus.DRAFT);
        when(eventMapper.toDto(event)).thenReturn(dto);

        assertThat(eventService.findByCode("EVT-1")).isEqualTo(dto);
    }

    @Test
    void findByCodeShouldThrowWhenEventDoesNotExist() {
        when(eventRepository.findByEventCode("NO-EXISTE"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.findByCode("NO-EXISTE"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("NO-EXISTE");
    }

    @Test
    void findPublishedEventsShouldReturnMappedEvents() {
        Event event = new Event(
                "EVT-PUB",
                "Evento",
                "Descripción",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(2),
                0,
                activeVenue
        );

        when(eventRepository.findByStatusOrderByEventDateAsc(
                EventStatus.PUBLISHED
        )).thenReturn(List.of(event));

        EventResponseDto dto = response(
                "EVT-PUB",
                EventStatus.PUBLISHED
        );

        when(eventMapper.toDto(event)).thenReturn(dto);

        assertThat(eventService.findPublishedEvents())
                .containsExactly(dto);
    }

    @Test
    void publishShouldChangeDraftToPublished() {
        Event event = new Event(
                "EVT-PUB",
                "Evento",
                "Descripción",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                LocalDateTime.now().plusDays(2),
                0,
                activeVenue
        );

        when(eventRepository.findByEventCode("EVT-PUB"))
                .thenReturn(Optional.of(event));

        when(eventMapper.toDto(event))
                .thenReturn(response("EVT-PUB", EventStatus.PUBLISHED));

        EventResponseDto result = eventService.publish("EVT-PUB");

        assertThat(event.getStatus()).isEqualTo(EventStatus.PUBLISHED);
        assertThat(result.status()).isEqualTo(EventStatus.PUBLISHED);
    }

    @Test
    void publishShouldRejectNonDraftEvent() {
        Event event = new Event(
                "EVT-PUB",
                "Evento",
                "Descripción",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(2),
                0,
                activeVenue
        );

        when(eventRepository.findByEventCode("EVT-PUB"))
                .thenReturn(Optional.of(event));

        assertThatThrownBy(() -> eventService.publish("EVT-PUB"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("DRAFT");
    }

    @Test
    void publishShouldRejectEventWithInactiveVenue() {
        Venue inactiveVenue = new Venue(
                "VEN-OFF",
                "Venue inactivo",
                "Bogotá",
                "Calle 2",
                100,
                false
        );

        Event event = new Event(
                "EVT-PUB",
                "Evento",
                "Descripción",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                LocalDateTime.now().plusDays(2),
                0,
                inactiveVenue
        );

        when(eventRepository.findByEventCode("EVT-PUB"))
                .thenReturn(Optional.of(event));

        assertThatThrownBy(() -> eventService.publish("EVT-PUB"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("inactivo");
    }

    @Test
    void addArtistShouldAssociateArtistWithEvent() {
        Event event = new Event(
                "EVT-ART",
                "Evento",
                "Descripción",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                LocalDateTime.now().plusDays(2),
                0,
                activeVenue
        );

        Artist artist = new Artist(
                "Artista X",
                "Colombia",
                "Rock",
                true
        );

        when(eventRepository.findByEventCode("EVT-ART"))
                .thenReturn(Optional.of(event));
        when(artistRepository.findById(10L))
                .thenReturn(Optional.of(artist));
        when(eventMapper.toDto(event))
                .thenReturn(response("EVT-ART", EventStatus.DRAFT));

        eventService.addArtist("EVT-ART", 10L);

        assertThat(event.getArtists()).contains(artist);
        assertThat(artist.getEvents()).contains(event);
    }

    @Test
    void addArtistShouldRejectUnknownArtist() {
        Event event = new Event(
                "EVT-ART",
                "Evento",
                "Descripción",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                LocalDateTime.now().plusDays(2),
                0,
                activeVenue
        );

        when(eventRepository.findByEventCode("EVT-ART"))
                .thenReturn(Optional.of(event));
        when(artistRepository.findById(404L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                eventService.addArtist("EVT-ART", 404L)
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Artista no encontrado");
    }

    @Test
    void addArtistShouldRejectDuplicateArtist() {
        Event event = new Event(
                "EVT-ART",
                "Evento",
                "Descripción",
                EventCategory.MUSIC,
                EventStatus.DRAFT,
                LocalDateTime.now().plusDays(2),
                0,
                activeVenue
        );

        Artist artist = new Artist(
                "Artista X",
                "Colombia",
                "Rock",
                true
        );

        event.addArtist(artist);

        when(eventRepository.findByEventCode("EVT-ART"))
                .thenReturn(Optional.of(event));
        when(artistRepository.findById(10L))
                .thenReturn(Optional.of(artist));

        assertThatThrownBy(() ->
                eventService.addArtist("EVT-ART", 10L)
        )
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("ya se encuentra asociado");
    }

    @Test
    void addArtistShouldRejectCancelledEvent() {
        Event event = new Event(
                "EVT-CAN",
                "Evento",
                "Descripción",
                EventCategory.MUSIC,
                EventStatus.CANCELLED,
                LocalDateTime.now().plusDays(2),
                0,
                activeVenue
        );

        Artist artist = new Artist(
                "Artista X",
                "Colombia",
                "Rock",
                true
        );

        when(eventRepository.findByEventCode("EVT-CAN"))
                .thenReturn(Optional.of(event));
        when(artistRepository.findById(10L))
                .thenReturn(Optional.of(artist));

        assertThatThrownBy(() ->
                eventService.addArtist("EVT-CAN", 10L)
        ).isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void findByArtistShouldReturnMappedEvents() {
        Event event = new Event(
                "EVT-ART",
                "Evento",
                "Descripción",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(2),
                0,
                activeVenue
        );

        when(eventRepository.findByArtistStageName("Artista X"))
                .thenReturn(List.of(event));

        EventResponseDto dto = response(
                "EVT-ART",
                EventStatus.PUBLISHED
        );

        when(eventMapper.toDto(event)).thenReturn(dto);

        assertThat(eventService.findByArtist("Artista X"))
                .containsExactly(dto);
    }
}
