package com.pulsepass.pulsepass.security;

import com.pulsepass.pulsepass.domain.UserRole;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService;
    private SecurityPrincipal principal;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties();
        properties.setIssuer("pulsepass-test");
        properties.setSecretBase64(
                Base64.getEncoder().encodeToString(new byte[32])
        );
        properties.setAccessTokenTtl(Duration.ofMinutes(15));

        jwtService = new JwtService(properties);

        principal = new SecurityPrincipal(
                42L,
                "andrea",
                "andrea@example.com",
                "$2a$10$hashDePrueba",
                UserRole.USER,
                true
        );
    }

    @Test
    void shouldGenerateAndValidateToken() {
        String token = jwtService.generateToken(principal);

        Claims claims = jwtService.parseAndValidate(token);

        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(claims.getIssuer()).isEqualTo("pulsepass-test");
        assertThat(claims.getIssuedAt()).isNotNull();
        assertThat(claims.getExpiration()).isNotNull();
        assertThat(claims.getId()).isNotBlank();
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
    }

    
    @Test
    void shouldRejectModifiedToken() {
        String token = jwtService.generateToken(principal);

        String[] parts = token.split("\\.");
        assertThat(parts).hasSize(3);

        String alteredPayload = parts[1].substring(0, parts[1].length() - 1)
                + (parts[1].endsWith("a") ? "b" : "a");

        String alteredToken = parts[0] + "." + alteredPayload + "." + parts[2];

        assertThatThrownBy(
                () -> jwtService.parseAndValidate(alteredToken)
        ).isInstanceOf(JwtException.class);
    }

}