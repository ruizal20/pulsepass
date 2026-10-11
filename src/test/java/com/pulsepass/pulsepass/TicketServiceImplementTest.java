package com.pulsepass.pulsepass;

import com.pulsepass.pulsepass.domain.*;
import com.pulsepass.pulsepass.dto.response.TicketResponseDto;
import com.pulsepass.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.TicketMapper;
import com.pulsepass.pulsepass.repository.EventRepository;
import com.pulsepass.pulsepass.repository.TicketRepository;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.service.impl.TicketServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TicketMapper ticketMapper;

    @InjectMocks
    private TicketServiceImpl ticketService;

    private User activeUser;
    private Event publishedEvent;
    private Venue venue;

    @BeforeEach
    void setUp() {
        // Configurar un recinto con capacidad de 2 personas
        venue = new Venue("VEN-TST", "Test Arena", "Bogota", "Calle 100", 2, true);

        // Configurar un evento publicado para el futuro con edad mínima 18
        publishedEvent = new Event(
                "EVT-TST", "Concierto Rock", "Festival",
                EventCategory.MUSIC, EventStatus.PUBLISHED,
                LocalDateTime.now().plusDays(5), 18, venue
        );

        // Configurar un usuario activo y mayor de edad (nacido en el año 2000)
        activeUser = new User("andrea", "andrea@email.com", true);
        UserProfile profile = new UserProfile("Andrea", "Pérez", "3000000000", "Bogotá", LocalDate.of(2000, 5, 15), activeUser);
        activeUser.assignProfile(profile);
    }

    @Test
    void shouldPurchaseTicketSuccessfully() {
        // ARRANGE
        PurchaseTicketRequest request = new PurchaseTicketRequest("andrea@email.com", "EVT-TST", TicketType.GENERAL);

        when(userRepository.findByEmail("andrea@email.com")).thenReturn(Optional.of(activeUser));
        when(eventRepository.findByEventCode("EVT-TST")).thenReturn(Optional.of(publishedEvent));
        when(ticketRepository.countPaidTicketsByEventCode("EVT-TST")).thenReturn(0L);
        
        Ticket savedTicket = new Ticket("TCK-12345", TicketType.GENERAL, BigDecimal.valueOf(50000), TicketStatus.PAID, LocalDateTime.now(), activeUser, publishedEvent);
        when(ticketRepository.save(any(Ticket.class))).thenReturn(savedTicket);

        TicketResponseDto responseDto = new TicketResponseDto();
        responseDto.setTicketCode("TCK-12345");
        responseDto.setStatus(TicketStatus.PAID);
        when(ticketMapper.toDto(any(Ticket.class))).thenReturn(responseDto);

        // ACT
        TicketResponseDto result = ticketService.purchase(request);

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.getTicketCode()).isEqualTo("TCK-12345");
        assertThat(result.getStatus()).isEqualTo(TicketStatus.PAID);

        // Verificar que se llamó al repositorio para guardar
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    void shouldThrowExceptionWhenUserIsUnderage() {
        // ARRANGE: Usuario menor de edad (nacido hace 15 años)
        User underageUser = new User("laura", "laura@email.com", true);
        UserProfile youngProfile = new UserProfile("Laura", "Gomez", "3111111111", "Medellin", LocalDate.now().minusYears(15), underageUser);
        underageUser.assignProfile(youngProfile);

        PurchaseTicketRequest request = new PurchaseTicketRequest("laura@email.com", "EVT-TST", TicketType.GENERAL);

        when(userRepository.findByEmail("laura@email.com")).thenReturn(Optional.of(underageUser));
        when(eventRepository.findByEventCode("EVT-TST")).thenReturn(Optional.of(publishedEvent));

        // ACT & ASSERT: Debe lanzar BusinessRuleException por la edad mínima (18)
        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("edad mínima requerida");

        // Verificar que NUNCA se intentó guardar un ticket
        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void shouldThrowExceptionWhenVenueIsSoldOut() {
        // ARRANGE: La cantidad de tickets pagados ya alcanzó la capacidad máxima (2)
        PurchaseTicketRequest request = new PurchaseTicketRequest("andrea@email.com", "EVT-TST", TicketType.VIP);

        when(userRepository.findByEmail("andrea@email.com")).thenReturn(Optional.of(activeUser));
        when(eventRepository.findByEventCode("EVT-TST")).thenReturn(Optional.of(publishedEvent));
        when(ticketRepository.countPaidTicketsByEventCode("EVT-TST")).thenReturn(2L); // Capacidad llena

        // ACT & ASSERT
        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("se encuentra agotado");

        verify(ticketRepository, never()).save(any(Ticket.class));
    }
}
