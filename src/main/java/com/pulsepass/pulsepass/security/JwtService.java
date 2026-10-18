package com.pulsepass.pulsepass.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey key;

    public JwtService(JwtProperties properties) {
        this.properties = properties;

        if (properties.getIssuer() == null
                || properties.getIssuer().isBlank()) {
            throw new IllegalStateException(
                    "La propiedad pulsepass.security.jwt.issuer es obligatoria."
            );
        }

        String secretBase64 = properties.getSecretBase64();

        if (secretBase64 == null || secretBase64.isBlank()) {
            throw new IllegalStateException(
                    "Debes configurar PULSEPASS_JWT_SECRET_BASE64."
            );
        }

        if (properties.getAccessTokenTtl() == null
                || properties.getAccessTokenTtl().isZero()
                || properties.getAccessTokenTtl().isNegative()) {
            throw new IllegalStateException(
                    "La duración del JWT debe ser positiva."
            );
        }

        byte[] decodedSecret;

        try {
            decodedSecret = Decoders.BASE64.decode(secretBase64);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "PULSEPASS_JWT_SECRET_BASE64 no contiene Base64 válido.",
                    exception
            );
        }

        if (decodedSecret.length < 32) {
            throw new IllegalStateException(
                    "La clave JWT debe contener al menos 32 bytes aleatorios."
            );
        }

        this.key = Keys.hmacShaKeyFor(decodedSecret);
    }

    public String generateToken(SecurityPrincipal principal) {

        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(
                properties.getAccessTokenTtl()
        );

        return Jwts.builder()
                .subject(principal.getId().toString())
                .issuer(properties.getIssuer())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .id(UUID.randomUUID().toString())
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    /*
     * Verifica la firma y el issuer antes de devolver los claims.
     * También exige los campos mínimos que este proyecto necesita.
     */
    public Claims parseAndValidate(String token) {

        Jws<Claims> signedJwt = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(properties.getIssuer())
                .build()
                .parseSignedClaims(token);

        if (!Jwts.SIG.HS256.getId()
                .equals(signedJwt.getHeader().getAlgorithm())) {
            throw new UnsupportedJwtException(
                    "El algoritmo del token no está permitido."
            );
        }

        Claims claims = signedJwt.getPayload();

        if (claims.getSubject() == null
                || claims.getSubject().isBlank()
                || claims.getIssuedAt() == null
                || claims.getExpiration() == null
                || claims.getId() == null
                || claims.getId().isBlank()) {
            throw new MalformedJwtException(
                    "Al token le faltan claims obligatorios."
            );
        }

        if (claims.getIssuedAt().toInstant().isAfter(Instant.now())) {
            throw new MalformedJwtException(
                    "La fecha de emisión del token no es válida."
            );
        }

        return claims;
    }

    public long getAccessTokenTtlSeconds() {
        Duration ttl = properties.getAccessTokenTtl();
        return ttl.toSeconds();
    }
}