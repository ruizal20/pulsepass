package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.dto.response.UserResponseDto;
import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;

public interface UserService {
    UserResponseDto register(RegisterUserRequest request);
    UserResponseDto findByEmail(String email);
    UserResponseDto findByUsername(String username);
}
