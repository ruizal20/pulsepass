package com.pulsepass.pulsepass;

import com.pulsepass.pulsepass.domain.*;
import com.pulsepass.pulsepass.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Testcontainers
@SpringBootTest
@Transactional
class PersistenceIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("pulsepass_test")
            .withUsername("postgres")
            .withPassword("postgres");

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Test
    void shouldValidateFlywayAndContext() {
        assertThat(postgres.isRunning()).isTrue();
        assertThat(venueRepository.count()).isGreaterThanOrEqualTo(0);
    }

    @Test
    void shouldFulfillAC001AndAC002_VenueAndEventPersistence() {
        // AC-001: Venue válido y recuperable por código con capacidad > 0[cite: 3]
        Venue venue = new Venue("VEN-SMR-01", "Marina Convention Center", "Santa Marta", "Calle 10", 5000, true);
        venueRepository.saveAndFlush(venue);
        
        Venue retrievedVenue = venueRepository.findByCode("VEN-SMR-01").orElseThrow();
        assertThat(retrievedVenue.getCapacity()).isGreaterThan(0);

        // AC-002: Evento asociado a un Venue recuperable por eventCode[cite: 3]
        Event event = new Event(
                "CMF-2026",
                "Caribbean Music Fest 2026",
                "Festival",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.of(2026, 12, 15, 18, 0),
                18,
                retrievedVenue
        );
        eventRepository.saveAndFlush(event);

        Event retrievedEvent = eventRepository.findByEventCode("CMF-2026").orElseThrow();
        assertThat(retrievedEvent.getVenue().getCode()).isEqualTo("VEN-SMR-01");
    }

    @Test
    void shouldFulfillAC003_EventManyToManyArtists() {
        // AC-003: Asociar múltiples artistas al evento sin duplicar asociaciones[cite: 3]
        Venue venue = new Venue("VEN-ART-01", "Arena Test", "Cartagena", "Av. 1", 3000, true);
        venueRepository.save(venue);

        Event event = new Event(
                "ART-EVT-01", "Festival de Artistas", "Multi-artista",
                EventCategory.MUSIC, EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(10), 18, venue
        );

        // Recuperar artistas insertados por la migración Flyway V2 ("Solar Beat", "Neon Waves")[cite: 3]
        Artist artist1 = artistRepository.findByStageName("Solar Beat").orElseThrow();
        Artist artist2 = artistRepository.findByStageName("Neon Waves").orElseThrow();

        event.addArtist(artist1);
        event.addArtist(artist2);
        eventRepository.saveAndFlush(event);

        // Verificar búsqueda por artista (AC-007)[cite: 3]
        List<Event> eventsByArtist = eventRepository.findByArtistStageName("Solar Beat");
        assertThat(eventsByArtist).hasSize(1);
        assertThat(eventsByArtist.get(0).getEventCode()).isEqualTo("ART-EVT-01");
    }

    @Test
    void shouldFulfillAC004_UserProfileStrictOneToOne() {
        // AC-004: Impedir asociar un segundo perfil al mismo usuario por restricción UNIQUE[cite: 3]
        User user = new User("unique_user", "user@pulsepass.com", true);
        userRepository.saveAndFlush(user);

        UserProfile profile1 = new UserProfile("Ana", "Gómez", "3000000000", "Bogotá", LocalDate.of(1990, 1, 1), user);
        userProfileRepository.saveAndFlush(profile1);

        UserProfile profile2 = new UserProfile("Ana Copia", "Gómez", "3111111111", "Medellín", LocalDate.of(1990, 1, 1), user);
        
        assertThatThrownBy(() -> userProfileRepository.saveAndFlush(profile2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void shouldFulfillAC005_TicketCodeUniqueConstraint() {
        // AC-005: PostgreSQL rechaza ticketCode duplicado[cite: 3]
        Venue venue = new Venue("VEN-TCK-01", "Teatro", "Cali", "Calle 5", 2000, true);
        venueRepository.save(venue);
        Event event = new Event("EVT-TCK", "Concierto", "Rock", EventCategory.MUSIC, EventStatus.PUBLISHED, LocalDateTime.now().plusDays(5), 14, venue);
        eventRepository.save(event);
        User user = new User("ticket_buyer", "buyer@pulsepass.com", true);
        userRepository.save(user);

        Ticket ticket1 = new Ticket("TCK-UNIQUE-99", TicketType.VIP, BigDecimal.valueOf(150000), TicketStatus.PAID, LocalDateTime.now(), user, event);
        ticketRepository.saveAndFlush(ticket1);

        Ticket ticket2 = new Ticket("TCK-UNIQUE-99", TicketType.GENERAL, BigDecimal.valueOf(50000), TicketStatus.PAID, LocalDateTime.now(), user, event);
        
        assertThatThrownBy(() -> ticketRepository.saveAndFlush(ticket2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void shouldFulfillAC006_FilterPublishedEventsOnly() {
        // AC-006: Consultar eventos PUBLISHED y asegurar que no traiga DRAFT o CANCELLED[cite: 3]
        Venue venue = new Venue("VEN-ST-01", "Auditorio", "Barranquilla", "Calle 72", 1000, true);
        venueRepository.save(venue);

        Event publishedEvent = new Event("EVT-PUB", "Pub Event", "Desc", EventCategory.EDUCATION, EventStatus.PUBLISHED, LocalDateTime.now().plusDays(2), 0, venue);
        Event draftEvent = new Event("EVT-DFT", "Draft Event", "Desc", EventCategory.EDUCATION, EventStatus.DRAFT, LocalDateTime.now().plusDays(3), 0, venue);
        eventRepository.saveAll(List.of(publishedEvent, draftEvent));

        List<Event> publishedList = eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED);
        
        assertThat(publishedList).extracting(Event::getEventCode).contains("EVT-PUB");
        assertThat(publishedList).extracting(Event::getEventCode).doesNotContain("EVT-DFT");
    }

    @Test
    void shouldFulfillAC008_PaidTicketsCountAndSearch() {
        // AC-008: Conteo y consulta de ventas de tickets PAID por evento[cite: 3]
        Venue venue = new Venue("VEN-SALES-01", "Arena", "Pereira", "Av. Circunvalar", 4000, true);
        venueRepository.save(venue);
        Event event = new Event("EVT-SALES", "Tour", "Pop", EventCategory.MUSIC, EventStatus.PUBLISHED, LocalDateTime.now().plusDays(1), 18, venue);
        eventRepository.save(event);

        User u1 = new User("u1", "u1@pulsepass.com", true);
        User u2 = new User("u2", "u2@pulsepass.com", true);
        userRepository.saveAll(List.of(u1, u2));

        Ticket t1 = new Ticket("TCK-S1", TicketType.GENERAL, BigDecimal.valueOf(100000), TicketStatus.PAID, LocalDateTime.now(), u1, event);
        Ticket t2 = new Ticket("TCK-S2", TicketType.VIP, BigDecimal.valueOf(200000), TicketStatus.PAID, LocalDateTime.now(), u2, event);
        Ticket t3 = new Ticket("TCK-S3", TicketType.GENERAL, BigDecimal.valueOf(100000), TicketStatus.CANCELLED, LocalDateTime.now(), u1, event);
        ticketRepository.saveAll(List.of(t1, t2, t3));

        long paidCount = ticketRepository.countPaidTicketsByEventCode("EVT-SALES");
        assertThat(paidCount).isEqualTo(2); // Solo cuenta PAID, ignorando CANCELLED[cite: 3]
    }
}