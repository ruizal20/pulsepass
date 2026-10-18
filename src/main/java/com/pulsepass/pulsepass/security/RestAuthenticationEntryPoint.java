
package com.pulsepass.pulsepass.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final HandlerExceptionResolver exceptionResolver;

    public RestAuthenticationEntryPoint(
            @Qualifier("handlerExceptionResolver")
            HandlerExceptionResolver exceptionResolver
    ) {
        this.exceptionResolver = exceptionResolver;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {

        exceptionResolver.resolveException(
                request,
                response,
                null,
                new BadCredentialsException(
                        "Se requiere autenticación válida."
                )
        );
    }
}
