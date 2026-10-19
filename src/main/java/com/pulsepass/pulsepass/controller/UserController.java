package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.pulsepass.dto.response.UserResponseDto;
import com.pulsepass.pulsepass.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponseDto> register(
            @Valid @RequestBody RegisterUserRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.register(request));
    }

    @GetMapping("/by-email")
    @PreAuthorize("@authorizationService.canReadUserByEmail(#p0, authentication)")
    public ResponseEntity<UserResponseDto> getByEmail(
            @RequestParam String email
    ) {
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    @GetMapping("/by-username")
    @PreAuthorize("@authorizationService.canReadUserByUsername(#p0, authentication)")
    public ResponseEntity<UserResponseDto> getByUsername(
            @RequestParam String username
    ) {
        return ResponseEntity.ok(userService.findByUsername(username));
    }
}