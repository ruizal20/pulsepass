package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.dto.response.VenueResponseDto;
import com.pulsepass.pulsepass.security.CustomUserDetailsService;
import com.pulsepass.pulsepass.security.JwtService;
import com.pulsepass.pulsepass.service.VenueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(VenueController.class)
class VenueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private VenueService venueService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private AuthenticationEntryPoint authenticationEntryPoint;

    private VenueResponseDto venue() {
        return new VenueResponseDto(
                1L, "VEN-SMR-01", "Teatro Municipal",
                "Cienaga", "Calle 10 #5-20", 800, true
        );
    }

    @Test
    void shouldReturnVenueByCode() throws Exception {
        when(venueService.findByCode("VEN-SMR-01"))
                .thenReturn(venue());

        mockMvc.perform(get("/api/venues/{code}", "VEN-SMR-01")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("VEN-SMR-01"))
                .andExpect(jsonPath("$.name").value("Teatro Municipal"))
                .andExpect(jsonPath("$.city").value("Cienaga"))
                .andExpect(jsonPath("$.active").value(true));

        verify(venueService).findByCode("VEN-SMR-01");
        verifyNoMoreInteractions(venueService);
    }

    @Test
    void shouldReturnActiveVenues() throws Exception {
        when(venueService.findActiveVenues())
                .thenReturn(List.of(venue()));

        mockMvc.perform(get("/api/venues/active")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].code").value("VEN-SMR-01"))
                .andExpect(jsonPath("$[0].active").value(true));

        verify(venueService).findActiveVenues();
        verifyNoMoreInteractions(venueService);
    }
} 
