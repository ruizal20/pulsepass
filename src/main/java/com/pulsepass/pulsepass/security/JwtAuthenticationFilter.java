package com.pulsepass.pulsepass.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationEntryPoint authenticationEntryPoint;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService,
            AuthenticationEntryPoint authenticationEntryPoint
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader(HttpHeaders.AUTHORIZATION);

        /*
         * Si no llega Bearer, el filtro deja continuar la petición.
         * SecurityConfig decidirá si la ruta es pública o protegida.
         */
        if (authorizationHeader == null
                || !authorizationHeader.regionMatches(
                        true, 0, "Bearer ", 0, 7
                )) {
            filterChain.doFilter(request, response);
            return;
        }

        /*
         * No se sobrescribe una autenticación que ya exista.
         */
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authorizationHeader.substring(7).trim();

            if (token.isBlank()) {
                throw new BadCredentialsException("Token vacío.");
            }

            Claims claims = jwtService.parseAndValidate(token);

            Long userId = Long.parseLong(claims.getSubject());

            /*
             * Consulta el usuario actual, incluyendo el estado y rol.
             */
            SecurityPrincipal principal =
                    userDetailsService.loadUserById(userId);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            principal.getAuthorities()
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

        } catch (JwtException
                 | IllegalArgumentException
                 | AuthenticationException exception) {

            SecurityContextHolder.clearContext();

            authenticationEntryPoint.commence(
                    request,
                    response,
                    new BadCredentialsException(
                            "Token inválido o no autorizado."
                    )
            );

            return;
        }

        filterChain.doFilter(request, response);
    }
}