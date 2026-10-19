package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.domain.EventStatus;
import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.domain.UserRole;
import com.pulsepass.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.pulsepass.repository.EventRepository;
import com.pulsepass.pulsepass.repository.TicketRepository;
import com.pulsepass.pulsepass.repository.UserRepository;
import com.pulsepass.pulsepass.security.SecurityPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service("authorizationService")
@Transactional(readOnly = true)
public class AuthorizationService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;

    public AuthorizationService(
            UserRepository userRepository,
            TicketRepository ticketRepository,
            EventRepository eventRepository
    ) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.eventRepository = eventRepository;
    }

    private SecurityPrincipal principal(Authentication authentication) {
        if (authentication == null
                || !(authentication.getPrincipal() instanceof SecurityPrincipal current)) {
            return null;
        }

        return current;
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null
                && authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_" + role)
                );
    }

    private boolean isAdmin(Authentication authentication) {
        return hasRole(authentication, "ADMIN");
    }

    public boolean canReadUserByEmail(
            String email,
            Authentication authentication
    ) {
        if (isAdmin(authentication)) {
            return true;
        }

        SecurityPrincipal current = principal(authentication);

        if (current == null || current.getRole() != UserRole.USER) {
            return false;
        }

        Optional<User> target = userRepository.findByEmailIgnoreCase(email);

        // Si no existe, se conserva el 404 del servicio original.
        return target.isEmpty()
                || target.get().getId().equals(current.getId());
    }

    public boolean canReadUserByUsername(
            String username,
            Authentication authentication
    ) {
        if (isAdmin(authentication)) {
            return true;
        }

        SecurityPrincipal current = principal(authentication);

        if (current == null || current.getRole() != UserRole.USER) {
            return false;
        }

        Optional<User> target = userRepository.findByUsername(username);

        return target.isEmpty()
                || target.get().getId().equals(current.getId());
    }

    public boolean canPurchaseTicket(
            PurchaseTicketRequest request,
            Authentication authentication
    ) {
        SecurityPrincipal current = principal(authentication);

        if (current == null || current.getRole() != UserRole.USER) {
            return false;
        }

        Optional<User> requestedUser =
                userRepository.findByEmailIgnoreCase(request.userEmail());

        return requestedUser.isPresent()
                && requestedUser.get().getId().equals(current.getId());
    }

    public boolean canAccessTicket(
            String ticketCode,
            Authentication authentication
    ) {
        if (isAdmin(authentication) || hasRole(authentication, "STAFF")) {
            return true;
        }

        SecurityPrincipal current = principal(authentication);

        if (current == null || current.getRole() != UserRole.USER) {
            return false;
        }

        return ticketRepository.findByTicketCode(ticketCode)
                .map(ticket ->
                        ticket.getUser().getId().equals(current.getId())
                )
                // Si no existe, el servicio conserva el 404 original.
                .orElse(true);
    }

    public boolean canCancelTicket(
            String ticketCode,
            Authentication authentication
    ) {
        if (isAdmin(authentication)) {
            return true;
        }

        SecurityPrincipal current = principal(authentication);

        if (current == null || current.getRole() != UserRole.USER) {
            return false;
        }

        return ticketRepository.findByTicketCode(ticketCode)
                .map(ticket ->
                        ticket.getUser().getId().equals(current.getId())
                )
                .orElse(true);
    }

    public boolean canAccessUserTickets(
            String email,
            Authentication authentication
    ) {
        if (isAdmin(authentication)) {
            return true;
        }

        SecurityPrincipal current = principal(authentication);

        if (current == null || current.getRole() != UserRole.USER) {
            return false;
        }

        Optional<User> target =
                userRepository.findByEmailIgnoreCase(email);

        return target.isEmpty()
                || target.get().getId().equals(current.getId());
    }

    public boolean canViewEvent(
            String eventCode,
            Authentication authentication
    ) {
        return eventRepository.findByEventCode(eventCode)
                .map(event ->
                        event.getStatus() == EventStatus.PUBLISHED
                                || hasRole(authentication, "STAFF")
                                || isAdmin(authentication)
                )
                // Si no existe, el servicio conserva el 404 original.
                .orElse(true);
    }

    public boolean canSeeUnpublishedEvents(Authentication authentication) {
        return hasRole(authentication, "STAFF")
                || isAdmin(authentication);
    }
}