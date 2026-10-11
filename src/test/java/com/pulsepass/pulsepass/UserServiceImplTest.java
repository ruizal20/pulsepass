package com.pulsepass.pulsepass;

import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.dto.response.UserResponseDto;
import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.pulsepass.mapper.UserMapper;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.service.impl.UserServiceImpl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void shouldRegisterUserSuccessfully() {
        // ARRANGE (TEST-USER-001)
        RegisterUserRequest request = new RegisterUserRequest(
                "carlos123", "carlos@email.com", "Carlos", "Pérez",
                "3001234567", "Bogotá", LocalDate.of(1995, 8, 20)
        );

        when(userRepository.existsByUsername("carlos123")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("carlos@email.com")).thenReturn(false);

        User savedUser = new User("carlos123", "carlos@email.com", true);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setUsername("carlos123");
        responseDto.setEmail("carlos@email.com");
        responseDto.setActive(true);
        when(userMapper.toDto(any(User.class))).thenReturn(responseDto);

        // ACT
        UserResponseDto result = userService.register(request);

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("carlos123");
        assertThat(result.getActive()).isTrue(); // BR-USER-003
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenUsernameAlreadyExists() {
        // ARRANGE (TEST-USER-002)
        RegisterUserRequest request = new RegisterUserRequest(
                "carlos123", "nuevo@email.com", "Carlos", "Pérez",
                "3001234567", "Bogotá", LocalDate.of(1995, 8, 20)
        );

        when(userRepository.existsByUsername("carlos123")).thenReturn(true);

        // ACT & ASSERT
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("nombre de usuario ya está registrado");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenBirthDateIsInTheFuture() {
        // ARRANGE (TEST-USER-004)
        RegisterUserRequest request = new RegisterUserRequest(
                "future_user", "future@email.com", "Future", "User",
                "3001234567", "Bogotá", LocalDate.now().plusDays(1)
        );

        when(userRepository.existsByUsername("future_user")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("future@email.com")).thenReturn(false);

        // ACT & ASSERT
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("fecha de nacimiento no puede ser una fecha futura");

        verify(userRepository, never()).save(any(User.class));
    }
}