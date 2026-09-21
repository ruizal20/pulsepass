package com.pulsepass.pulsepass.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    // Relación 1:1 bidireccional con UserProfile
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private UserProfile userProfile;

    // Relación 1:N con Ticket (Un usuario compra muchos tickets)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ticket> tickets = new ArrayList<>();

    // Constructor vacío obligatorio para JPA
    protected User() {
    }

    public User(String username, String email, Boolean active) {
        this.username = username;
        this.email = email;
        this.active = active;
    }

    // Método para asociar el perfil de manera sincronizada
    public void assignProfile(UserProfile profile) {
        this.userProfile = profile;
        // profile.setUser(this);
    }

    // Getters
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public Boolean getActive() { return active; }
    public UserProfile getUserProfile() { return userProfile; }
    public List<Ticket> getTickets() { return tickets; }
}