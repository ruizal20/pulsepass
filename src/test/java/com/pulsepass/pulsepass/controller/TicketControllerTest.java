package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.controller.TicketController;
import com.pulsepass.pulsepass.domain.EventCategory;
import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.domain.TicketStatus;
import com.pulsepass.pulsepass.domain.TicketType;
import com.pulsepass.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.pulsepass.dto.response.EventResponseDto;
import com.pulsepass.pulsepass.dto.response.TicketResponseDto;
import com.pulsepass.pulsepass.dto.response.VenueResponseDto;
import com.pulsepass.pulsepass.service.TicketService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

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

@WebMvcTest(TicketController.class)
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TicketService ticketService;

    private TicketResponseDto ticket(TicketStatus state) {
        EventResponseDto event = new EventResponseDto(
                10L,
                "EVT-001",
                "Festival Caribe",
                "Festival cultural",
                EventCategory.CULTURE,
                EventStatus.PUBLISHED,
                LocalDateTime.of(2027, 12, 15, 18, 0),
                18,
                null,
                new VenueResponseDto(
                        1L,
                        "VEN-SMR-01",
                        "Teatro Municipal",
                        "Cienaga",
                        "Calle 10 #5-20",
                        800,
                        true
                ),
                List.of()
        );

        return new TicketResponseDto(
                99L,
                "TCK-001",
                TicketType.GENERAL,
                BigDecimal.valueOf(50000),
                state,
                LocalDateTime.of(2026, 10, 10, 12, 0),
                event
        );
    }

    @Test
    void shouldPurchaseTicketAndReturn201() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenReturn(ticket(TicketStatus.PAID));

        String body = """
                {
                  "userEmail": "ana@example.com",
                  "eventCode": "EVT-001",
                  "type": "GENERAL"
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ticketCode").value("TCK-001"))
                .andExpect(jsonPath("$.status").value("PAID"));

        verify(ticketService).purchase(any(PurchaseTicketRequest.class));
        verifyNoMoreInteractions(ticketService);
    }

    @Test
    void shouldRejectInvalidPurchaseRequest() throws Exception {
        String body = """
                {
                  "userEmail": "not-email",
                  "eventCode": "",
                  "type": null
                }
                """;

        mockMvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details").exists());

        // La compra inválida no debe llegar al Service.
        verifyNoMoreInteractions(ticketService);
    }

    @Test
    void shouldFindTicketByCode() throws Exception {
        when(ticketService.findByCode("TCK-001"))
                .thenReturn(ticket(TicketStatus.PAID));

        mockMvc.perform(get("/api/tickets/{ticketCode}", "TCK-001")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ticketCode").value("TCK-001"));

        verify(ticketService).findByCode("TCK-001");
        verifyNoMoreInteractions(ticketService);
    }

    @Test
    void shouldFindTicketsByUserEmail() throws Exception {
        when(ticketService.findByUserEmail("ana@example.com"))
                .thenReturn(List.of(ticket(TicketStatus.PAID)));

        mockMvc.perform(get("/api/tickets/by-user")
                        .param("email", "ana@example.com")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ticketCode").value("TCK-001"));

        verify(ticketService).findByUserEmail("ana@example.com");
        verifyNoMoreInteractions(ticketService);
    }

    @Test
    void shouldCancelTicket() throws Exception {
        when(ticketService.cancel("TCK-001"))
                .thenReturn(ticket(TicketStatus.CANCELLED));

        mockMvc.perform(patch("/api/tickets/{ticketCode}/cancel", "TCK-001")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(ticketService).cancel("TCK-001");
        verifyNoMoreInteractions(ticketService);
    }

    @Test
    void shouldMarkTicketAsUsed() throws Exception {
        when(ticketService.markAsUsed("TCK-001"))
                .thenReturn(ticket(TicketStatus.USED));

        mockMvc.perform(patch("/api/tickets/{ticketCode}/use", "TCK-001")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("USED"));

        verify(ticketService).markAsUsed("TCK-001");
        verifyNoMoreInteractions(ticketService);
    }
} 
