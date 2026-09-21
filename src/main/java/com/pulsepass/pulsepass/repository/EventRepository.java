package com.pulsepass.pulsepass.repository;

import com.pulsepass.pulsepass.domain.Event;
import com.pulsepass.pulsepass.domain.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // 1. Buscar evento por su código único de negocio[cite: 3]
    Optional<Event> findByEventCode(String eventCode);

    // 2. Consultar eventos publicados ordenados por fecha ascendente (Requisito FR-EVT-005)[cite: 3]
    List<Event> findByStatusOrderByEventDateAsc(EventStatus status);

    // 3. Consultar eventos asociados a un venue usando su código de negocio (Navegación de relación)[cite: 3]
    List<Event> findByVenueCode(String venueCode);

    // 4. Consulta JPQL para buscar eventos donde participe un artista por su stageName (Requisito FR-SRC-001)[cite: 3]
    @Query("SELECT DISTINCT e FROM Event e JOIN e.artists a WHERE a.stageName = :stageName")
    List<Event> findByArtistStageName(@Param("stageName") String stageName);

    // Buscar eventos de una ciudad en los que participe un artista específico (FR-SRC-002)
    @Query("SELECT DISTINCT e FROM Event e JOIN e.venue v JOIN e.artists a WHERE v.city = :city AND a.stageName = :stageName")
    List<Event> findByCityAndArtistStageName(@Param("city") String city, @Param("stageName") String stageName);

    // Eventos recomendados / descubrimiento posterior a una fecha, en una ciudad y artista conteniendo texto (FR-SRC-003)
    @Query("""
        SELECT DISTINCT e FROM Event e 
        JOIN e.venue v 
        JOIN e.artists a 
        WHERE e.status = 'PUBLISHED' 
          AND e.eventDate >= :date 
          AND v.city = :city 
          AND LOWER(a.stageName) LIKE LOWER(CONCAT('%', :artistKeyword, '%'))
        ORDER BY e.eventDate ASC
    """)
    List<Event> findRecommendedEvents(
            @Param("date") LocalDateTime date,
            @Param("city") String city,
            @Param("artistKeyword") String artistKeyword
    );
}