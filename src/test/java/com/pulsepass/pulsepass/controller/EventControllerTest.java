
package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.domain.EventCategory;
import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.domain.TicketStatus;
import com.pulsepass.pulsepass.domain.TicketType;
import com.pulsepass.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.pulsepass.dto.response.ArtistResponseDto;
import com.pulsepass.pulsepass.dto.response.EventResponseDto;
import com.pulsepass.pulsepass.dto.response.TicketResponseDto;
import com.pulsepass.pulsepass.dto.response.VenueResponseDto;
import com.pulsepass.pulsepass.security.CustomUserDetailsService;
import com.pulsepass.pulsepass.security.JwtService;
import com.pulsepass.pulsepass.security.SecurityConfig;
import com.pulsepass.pulsepass.security.RestAuthenticationEntryPoint;
import com.pulsepass.pulsepass.security.RestAccessDeniedHandler;
import com.pulsepass.pulsepass.service.EventService;
import com.pulsepass.pulsepass.service.TicketService;
import com.pulsepass.pulsepass.service.AuthorizationService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Import;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@WebMvcTest(EventController.class)
@Import({
        SecurityConfig.class,
        RestAuthenticationEntryPoint.class,
        RestAccessDeniedHandler.class
})
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private TicketService ticketService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean(name = "authorizationService")
    private AuthorizationService authorizationService;

    private VenueResponseDto venue() {
        return new VenueResponseDto(
                1L, "VEN-SMR-01", "Teatro Municipal",
                "Cienaga", "Calle 10 #5-20", 800, true
        );
    }

    private ArtistResponseDto artist() {
        return new ArtistResponseDto(
                7L, "La Voz Caribe", "Cantante", "Tropical"
        );
    }

    private EventResponseDto event(EventStatus state) {
        return new EventResponseDto(
                10L,
                "EVT-001",
                "Festival Caribe",
                "Festival cultural",
                EventCategory.CULTURE,
                state,
                LocalDateTime.of(2027, 12, 15, 18, 0),
                18,
                null,
                venue(),
                List.of(artist())
        );
    }

    private TicketResponseDto ticket() {
        return new TicketResponseDto(
                99L,
                "TCK-001",
                TicketType.GENERAL,
                BigDecimal.valueOf(50000),
                TicketStatus.PAID,
                LocalDateTime.of(2026, 10, 10, 12, 0),
                event(EventStatus.PUBLISHED)
        );
    }

    @Test
    void shouldCreateEventAndReturn201() throws Exception {
        when(eventService.create(any(CreateEventRequest.class)))
                .thenReturn(event(EventStatus.DRAFT));

        String body = """
                {
                  "eventCode": "EVT-001",
                  "name": "Festival Caribe",
                  "description": "Festival cultural",
                  "category": "CULTURE",
                  "eventDate": "2027-12-15T18:00:00",
                  "minimumAge": 18,
                  "venueCode": "VEN-SMR-01"
                }
                """;

        mockMvc.perform(post("/api/events")
                .with(user("admin").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventCode").value("EVT-001"))
                .andExpect(jsonPath("$.status").value("DRAFT"));

        verify(eventService).create(any(CreateEventRequest.class));
        verifyNoMoreInteractions(eventService);
    }

    @Test
    void shouldRejectInvalidCreateEventRequest() throws Exception {
        String body = """
                {
                  "eventCode": "",
                  "name": "",
                  "description": "",
                  "category": null,
                  "eventDate": "2020-01-01T10:00:00",
                  "minimumAge": -1,
                  "venueCode": ""
                }
                """;

        mockMvc.perform(post("/api/events")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details").exists());

        // Un request inválido no debe llegar al Service.
        verifyNoMoreInteractions(eventService);
    }

    @Test
    void shouldReturnEventByCode() throws Exception {
        when(eventService.findByCode("EVT-001"))
                .thenReturn(event(EventStatus.PUBLISHED));

        when(authorizationService.canViewEvent(
                org.mockito.ArgumentMatchers.eq("EVT-001"),
                org.mockito.ArgumentMatchers.any()
        )).thenReturn(true);

        mockMvc.perform(get("/api/events/{eventCode}", "EVT-001")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventCode").value("EVT-001"))
                .andExpect(jsonPath("$.title").value("Festival Caribe"))
                .andExpect(jsonPath("$.venue.code").value("VEN-SMR-01"));

        verify(eventService).findByCode("EVT-001");
        verifyNoMoreInteractions(eventService);
    }

    @Test
    void shouldReturnPublishedEvents() throws Exception {
        when(eventService.findPublishedEvents())
                .thenReturn(List.of(event(EventStatus.PUBLISHED)));

        mockMvc.perform(get("/api/events/published")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventCode").value("EVT-001"));

        verify(eventService).findPublishedEvents();
        verifyNoMoreInteractions(eventService);
    }

    @Test
    void shouldPublishEvent() throws Exception {
        when(eventService.publish("EVT-001"))
                .thenReturn(event(EventStatus.PUBLISHED));

        mockMvc.perform(patch("/api/events/{eventCode}/publish", "EVT-001")
                .with(user("admin").roles("ADMIN"))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        verify(eventService).publish("EVT-001");
        verifyNoMoreInteractions(eventService);
    }

    @Test
    void shouldAddArtistToEvent() throws Exception {
        when(eventService.addArtist("EVT-001", 7L))
                .thenReturn(event(EventStatus.PUBLISHED));

        mockMvc.perform(post(
                        "/api/events/{eventCode}/artists/{artistId}",
                        "EVT-001", 7L)
                .with(user("admin").roles("ADMIN"))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventCode").value("EVT-001"));

        verify(eventService).addArtist("EVT-001", 7L);
        verifyNoMoreInteractions(eventService);
    }

    @Test
    void shouldFindEventsByArtist() throws Exception {
        when(eventService.findPublishedByArtist("La Voz Caribe"))
                .thenReturn(List.of(event(EventStatus.PUBLISHED)));

        mockMvc.perform(get("/api/events/by-artist")
                        .param("stageName", "La Voz Caribe")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventCode").value("EVT-001"));

        verify(eventService).findPublishedByArtist("La Voz Caribe");
        verifyNoMoreInteractions(eventService);
    }

    @Test
    void shouldReturnPaidTicketsForEvent() throws Exception {
        when(ticketService.findPaidTicketsByEvent("EVT-001"))
                .thenReturn(List.of(ticket()));

        mockMvc.perform(get(
                        "/api/events/{eventCode}/tickets/paid", "EVT-001")
                .with(user("staff").roles("STAFF"))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ticketCode").value("TCK-001"))
                .andExpect(jsonPath("$[0].status").value("PAID"));

        verify(ticketService).findPaidTicketsByEvent("EVT-001");
        verifyNoMoreInteractions(ticketService);
    }
}