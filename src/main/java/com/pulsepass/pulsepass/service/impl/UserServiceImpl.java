package com.pulsepass.pulsepass.service.impl;

import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.domain.UserProfile;
import com.pulsepass.pulsepass.dto.response.UserResponseDto;
import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.pulsepass.exception.BusinessRuleException;
import com.pulsepass.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.UserMapper;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public UserResponseDto register(RegisterUserRequest request) {
        // BR-USER-001: Username único
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("El nombre de usuario ya está registrado: " + request.username());
        }

        // BR-USER-002: Email único ignorando mayúsculas/minúsculas
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("El correo electrónico ya está registrado: " + request.email());
        }

        // BR-USER-005: La fecha de nacimiento no puede ser futura
        if (request.birthDate() != null && request.birthDate().isAfter(LocalDate.now())) {
            throw new BusinessRuleException("La fecha de nacimiento no puede ser una fecha futura.");
        }

        // BR-USER-003: Todo usuario nuevo inicia activo (active = true)
        User user = new User(request.username(), request.email(), true);

        // BR-USER-004: Crear User y UserProfile dentro de la misma transacción (relación 1:1)
        UserProfile profile = new UserProfile(
                request.firstName(),
                request.lastName(),
                request.phone(),
                request.city(),
                request.birthDate(),
                user
        );
        user.assignProfile(profile);

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Override
    public UserResponseDto findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
        return userMapper.toDto(user);
    }

    @Override
    public UserResponseDto findByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con username: " + username));
        return userMapper.toDto(user);
    }
}
