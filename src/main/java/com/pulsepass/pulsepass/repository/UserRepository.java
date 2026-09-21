package com.pulsepass.pulsepass.repository;

import com.pulsepass.pulsepass.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Buscar un usuario por su email ignorando o evaluando exactitud (Requisito PRD)
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);
}