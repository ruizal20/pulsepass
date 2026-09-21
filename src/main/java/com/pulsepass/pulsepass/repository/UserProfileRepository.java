package com.pulsepass.pulsepass.repository;

import com.pulsepass.pulsepass.domain.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    // Ejemplo de consulta por Query Method para buscar perfiles por ciudad
    List<UserProfile> findByCity(String city);
}