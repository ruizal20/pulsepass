package com.pulsepass.pulsepass.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    // Propietario de la relación 1:1 con User (contiene la FK user_id con unique = true)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Constructor vacío obligatorio para JPA
    protected UserProfile() {
    }

    public UserProfile(String firstName, String lastName, String phone, String city, LocalDate birthDate, User user) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.city = city;
        this.birthDate = birthDate;
        this.user = user;
    }

    // Getters
    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getPhone() { return phone; }
    public String getCity() { return city; }
    public LocalDate getBirthDate() { return birthDate; }
    public User getUser() { return user; }
}