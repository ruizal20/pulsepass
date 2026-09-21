package com.pulsepass.pulsepass.repository;

import com.pulsepass.pulsepass.domain.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    // Query Method automático para buscar un Venue por su código de negocio único
    Optional<Venue> findByCode(String code);
}