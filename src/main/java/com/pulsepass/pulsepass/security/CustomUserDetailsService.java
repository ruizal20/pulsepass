package com.pulsepass.pulsepass.security;

import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.repository.UserRepository;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    @Override
    public UserDetails loadUserByUsername(String identifier) {

        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() ->
                        new UsernameNotFoundException("Credenciales inválidas.")
                );

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new DisabledException("La cuenta no está activa.");
        }

        if (user.getPasswordHash() == null
                || user.getPasswordHash().isBlank()) {
            throw new UsernameNotFoundException("Credenciales inválidas.");
        }

        return toPrincipal(user);
    }

    public SecurityPrincipal loadUserById(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Usuario no encontrado.")
                );

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new DisabledException("La cuenta no está activa.");
        }

        if (user.getRole() == null) {
            throw new UsernameNotFoundException("Usuario no válido.");
        }

        String hash = user.getPasswordHash() == null
                ? ""
                : user.getPasswordHash();

        return new SecurityPrincipal(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                hash,
                user.getRole(),
                true
        );
    }

    private SecurityPrincipal toPrincipal(User user) {
        return new SecurityPrincipal(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                Boolean.TRUE.equals(user.getActive())
        );
    }
}