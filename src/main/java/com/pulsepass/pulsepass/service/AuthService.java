package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.dto.request.LoginRequest;
import com.pulsepass.pulsepass.dto.response.AuthResponse;
import com.pulsepass.pulsepass.security.JwtService;
import com.pulsepass.pulsepass.security.SecurityPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.identifier().trim(),
                                request.password()
                        )
                );

        if (!(authentication.getPrincipal()
                instanceof SecurityPrincipal principal)) {
            throw new BadCredentialsException("Credenciales inválidas.");
        }

        String token = jwtService.generateToken(principal);

        return new AuthResponse(
                token,
                "Bearer",
                jwtService.getAccessTokenTtlSeconds()
        );
    }
}