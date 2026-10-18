package com.pulsepass.pulsepass.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(

        @NotBlank(message = "Username o email es obligatorio")
        @Size(max = 150, message = "El identificador es demasiado largo")
        String identifier,

        @NotBlank(message = "La contraseña es obligatoria")
        String password

) {}