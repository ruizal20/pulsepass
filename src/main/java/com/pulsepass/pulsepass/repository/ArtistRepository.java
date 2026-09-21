package com.pulsepass.pulsepass.repository;

import com.pulsepass.pulsepass.domain.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {

    // Query Method para buscar un artista por su nombre artístico único
    Optional<Artist> findByStageName(String stageName);
}