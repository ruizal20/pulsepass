package com.pulsepass.pulsepass.repository;

import com.pulsepass.pulsepass.domain.Ticket;
import com.pulsepass.pulsepass.domain.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // 1. Buscar ticket por su código único de negocio
    Optional<Ticket> findByTicketCode(String ticketCode);

    // 2. Consultar tickets de un usuario navegando por su email (Requisito FR-TKT-006)
    List<Ticket> findByUserEmail(String email);

    // 3. Consultar tickets pagados de un evento mediante el eventCode (Requisito FR-TKT-007)
    @Query("SELECT t FROM Ticket t WHERE t.event.eventCode = :eventCode AND t.status = :status")
    List<Ticket> findByEventCodeAndStatus(@Param("eventCode") String eventCode, @Param("status") TicketStatus status);

    // 4. Conteo de ventas de tickets PAID para un evento (Requisito FR-TKT-008)
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.event.eventCode = :eventCode AND t.status = 'PAID'")
    long countPaidTicketsByEventCode(@Param("eventCode") String eventCode);
}