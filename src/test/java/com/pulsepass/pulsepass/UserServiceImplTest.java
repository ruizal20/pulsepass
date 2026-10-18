

package com.pulsepass.pulsepass;

import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.pulsepass.dto.response.UserResponseDto;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.UserMapper;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.service.impl.UserServiceImpl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void shouldRegisterUserSuccessfully() {
        RegisterUserRequest request = new RegisterUserRequest(
                "carlos123",
                "carlos@email.com",
                "UnaFraseSegura2026!",
                "Carlos",
                "Pérez",
                "3001234567",
                "Bogotá",
                LocalDate.of(1995, 8, 20)
        );

        when(userRepository.existsByUsername("carlos123"))
                .thenReturn(false);

        when(userRepository.existsByEmailIgnoreCase("carlos@email.com"))
                .thenReturn(false);
        
        when(passwordEncoder.encode("UnaFraseSegura2026!"))
            .thenReturn("$2a$10$hashDePrueba");

        User savedUser = new User(
                "carlos123",
                "carlos@email.com",
                true
        );

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        UserResponseDto responseDto = new UserResponseDto(
                1L,
                "carlos123",
                "carlos@email.com",
                true,
                null
        );

        when(userMapper.toDto(any(User.class)))
                .thenReturn(responseDto);

        UserResponseDto result = userService.register(request);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.username()).isEqualTo("carlos123");
        assertThat(result.email()).isEqualTo("carlos@email.com");
        assertThat(result.active()).isTrue();

        verify(userRepository).save(any(User.class));
        verify(userMapper).toDto(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenUsernameAlreadyExists() {
        RegisterUserRequest request = new RegisterUserRequest(
                "carlos123",
                "carlos@email.com",
                "UnaFraseSegura2026!",
                "Carlos",
                "Pérez",
                "3001234567",
                "Bogotá",
                LocalDate.of(1995, 8, 20)
        );

        when(userRepository.existsByUsername("carlos123"))
                .thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining(
                        "El nombre de usuario ya está registrado"
                );

        verify(userRepository, never()).save(any(User.class));
        verify(userMapper, never()).toDto(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        RegisterUserRequest request = new RegisterUserRequest(
                "carlos123",
                "carlos@email.com",
                "UnaFraseSegura2026!",
                "Carlos",
                "Pérez",
                "3001234567",
                "Bogotá",
                LocalDate.of(1995, 8, 20)
        );

        when(userRepository.existsByUsername("carlos123"))
                .thenReturn(false);

        when(userRepository.existsByEmailIgnoreCase("carlos@email.com"))
                .thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining(
                        "El correo electrónico ya está registrado"
                );

        verify(userRepository, never()).save(any(User.class));
        verify(userMapper, never()).toDto(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenBirthDateIsInTheFuture() {
        RegisterUserRequest request = new RegisterUserRequest(
                "future_user",
                "future@email.com",
                "SegundaFraseSegura2026!",
                "Future",
                "User",
                "3001234567",
                "Bogotá",
                LocalDate.now().plusDays(1)
        );

        when(userRepository.existsByUsername("future_user"))
                .thenReturn(false);

        when(userRepository.existsByEmailIgnoreCase("future@email.com"))
                .thenReturn(false);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining(
                        "La fecha de nacimiento no puede ser una fecha futura"
                );

        verify(userRepository, never()).save(any(User.class));
        verify(userMapper, never()).toDto(any(User.class));
    }

    @Test
    void shouldFindUserByEmailSuccessfully() {
        User user = new User(
                "carlos123",
                "carlos@email.com",
                true
        );

        UserResponseDto responseDto = new UserResponseDto(
                1L,
                "carlos123",
                "carlos@email.com",
                true,
                null
        );

        when(userRepository.findByEmail("carlos@email.com"))
                .thenReturn(Optional.of(user));

        when(userMapper.toDto(user))
                .thenReturn(responseDto);

        UserResponseDto result =
                userService.findByEmail("carlos@email.com");

        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo("carlos@email.com");
        assertThat(result.username()).isEqualTo("carlos123");

        verify(userRepository).findByEmail("carlos@email.com");
        verify(userMapper).toDto(user);
    }

    @Test
    void shouldThrowExceptionWhenEmailDoesNotExist() {
        when(userRepository.findByEmail("missing@email.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.findByEmail("missing@email.com")
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(
                        "Usuario no encontrado con email"
                );

        verify(userMapper, never()).toDto(any(User.class));
    }

    @Test
    void shouldFindUserByUsernameSuccessfully() {
        User user = new User(
                "carlos123",
                "carlos@email.com",
                true
        );

        UserResponseDto responseDto = new UserResponseDto(
                1L,
                "carlos123",
                "carlos@email.com",
                true,
                null
        );

        when(userRepository.findByUsername("carlos123"))
                .thenReturn(Optional.of(user));

        when(userMapper.toDto(user))
                .thenReturn(responseDto);

        UserResponseDto result =
                userService.findByUsername("carlos123");

        assertThat(result).isNotNull();
        assertThat(result.username()).isEqualTo("carlos123");
        assertThat(result.email()).isEqualTo("carlos@email.com");

        verify(userRepository).findByUsername("carlos123");
        verify(userMapper).toDto(user);
    }

    @Test
    void shouldThrowExceptionWhenUsernameDoesNotExist() {
        when(userRepository.findByUsername("usuario_inexistente"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.findByUsername("usuario_inexistente")
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(
                        "Usuario no encontrado con username"
                );

        verify(userMapper, never()).toDto(any(User.class));
    }
}