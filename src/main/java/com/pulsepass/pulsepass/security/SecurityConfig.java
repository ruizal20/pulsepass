package com.pulsepass.pulsepass.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationProvider authenticationProvider,
            AuthenticationEntryPoint authenticationEntryPoint,
            AccessDeniedHandler accessDeniedHandler
    ) throws Exception {

        http
            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)

            .authenticationProvider(authenticationProvider)

            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )

            .authorizeHttpRequests(auth -> auth

                // Registro e inicio de sesión públicos.
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/auth/login",
                    "/api/users"
                ).permitAll()

                // Consultas públicas de venues y artistas.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/venues/active",
                    "/api/venues/*",
                    "/api/artists/**"
                ).permitAll()

                // Consultas públicas de eventos publicados.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/events/published",
                    "/api/events/by-artist"
                ).permitAll()

                // Consulta de entradas pagadas: STAFF o ADMIN.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/events/*/tickets/paid"
                ).hasAnyRole("STAFF", "ADMIN")

                // Consulta de evento por código: requiere validación
                // adicional para impedir la exposición de borradores.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/events/*"
                ).permitAll()

                // Crear eventos: ADMIN.
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/events"
                ).hasRole("ADMIN")

                // Publicar eventos: ADMIN.
                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/events/*/publish"
                ).hasRole("ADMIN")

                // Asociar artistas a eventos: ADMIN.
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/events/*/artists/*"
                ).hasRole("ADMIN")

                // Comprar entradas: USER, con comprobación de propiedad.
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/tickets"
                ).hasRole("USER")

                // Marcar entradas como utilizadas: STAFF o ADMIN.
                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/tickets/*/use"
                ).hasAnyRole("STAFF", "ADMIN")

                // Las demás rutas requieren autenticación.
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}