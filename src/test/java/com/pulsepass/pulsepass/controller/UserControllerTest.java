
package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.controller.UserController;
import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.pulsepass.dto.response.UserProfileResponseDto;
import com.pulsepass.pulsepass.dto.response.UserResponseDto;
import com.pulsepass.pulsepass.service.UserService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    private UserResponseDto user() {
        UserProfileResponseDto profile = new UserProfileResponseDto(
                2L,
                "Ana",
                "Lopez",
                "3001234567",
                "Cienaga",
                LocalDate.of(1998, 5, 20)
        );

        return new UserResponseDto(
                1L, "ana98", "ana@example.com", true, profile
        );
    }

    @Test
    void shouldRegisterUserAndReturn201() throws Exception {
        when(userService.register(any(RegisterUserRequest.class)))
                .thenReturn(user());

        String body = """
                {
                  "username": "ana98",
                  "email": "ana@example.com",
                  "firstName": "Ana",
                  "lastName": "Lopez",
                  "phone": "3001234567",
                  "city": "Cienaga",
                  "birthDate": "1998-05-20"
                }
                """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username").value("ana98"))
                .andExpect(jsonPath("$.email").value("ana@example.com"))
                .andExpect(jsonPath("$.profile.firstName").value("Ana"));

        verify(userService).register(any(RegisterUserRequest.class));
        verifyNoMoreInteractions(userService);
    }

    @Test
    void shouldRejectInvalidRegistrationRequest() throws Exception {
        String body = """
                {
                  "username": "a",
                  "email": "not-an-email",
                  "firstName": "",
                  "lastName": "",
                  "phone": "",
                  "city": "",
                  "birthDate": "2999-01-01"
                }
                """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details").exists());

        // El Service no debe recibir el request inválido.
        verifyNoMoreInteractions(userService);
    }

    @Test
    void shouldFindUserByEmail() throws Exception {
        when(userService.findByEmail("ana@example.com"))
                .thenReturn(user());

        mockMvc.perform(get("/api/users/by-email")
                        .param("email", "ana@example.com")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.email").value("ana@example.com"));

        verify(userService).findByEmail("ana@example.com");
        verifyNoMoreInteractions(userService);
    }

    @Test
    void shouldFindUserByUsername() throws Exception {
        when(userService.findByUsername("ana98"))
                .thenReturn(user());

        mockMvc.perform(get("/api/users/by-username")
                        .param("username", "ana98")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("ana98"));

        verify(userService).findByUsername("ana98");
        verifyNoMoreInteractions(userService);
    }
}