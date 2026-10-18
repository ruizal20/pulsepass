package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.dto.response.ArtistResponseDto;
import com.pulsepass.pulsepass.service.ArtistService;
import com.pulsepass.pulsepass.security.CustomUserDetailsService;
import com.pulsepass.pulsepass.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ArtistController.class)
class ArtistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ArtistService artistService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private AuthenticationEntryPoint authenticationEntryPoint;

    private ArtistResponseDto artist() {
        return new ArtistResponseDto(
                7L,
                "La Voz Caribe",
                "Cantante de musica tropical",
                "Tropical"
        );
    }

    @Test
    void shouldReturnArtistById() throws Exception {
        when(artistService.findById(7L)).thenReturn(artist());

        mockMvc.perform(get("/api/artists/{id}", 7L)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.stageName").value("La Voz Caribe"));

        verify(artistService).findById(7L);
        verifyNoMoreInteractions(artistService);
    }

    @Test
    void shouldReturnArtistByStageName() throws Exception {
        when(artistService.findByStageName("La Voz Caribe"))
                .thenReturn(artist());

        mockMvc.perform(get("/api/artists/by-stage-name")
                        .param("stageName", "La Voz Caribe")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stageName").value("La Voz Caribe"));

        verify(artistService).findByStageName("La Voz Caribe");
        verifyNoMoreInteractions(artistService);
    }

    @Test
    void shouldReturnActiveArtists() throws Exception {
        when(artistService.findActiveArtists())
                .thenReturn(List.of(artist()));

        mockMvc.perform(get("/api/artists/active")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(7))
                .andExpect(jsonPath("$[0].stageName").value("La Voz Caribe"));

        verify(artistService).findActiveArtists();
        verifyNoMoreInteractions(artistService);
    }
} 
