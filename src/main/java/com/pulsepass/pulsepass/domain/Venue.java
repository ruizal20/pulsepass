package com.pulsepass.pulsepass.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "venues")
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    // Relación 1:N con Event (Un Venue tiene muchos Events)
    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Event> events = new ArrayList<>();

    // Constructor vacío obligatorio para JPA
    protected Venue() {
    }

    // Constructor con campos principales
    public Venue(String code, String name, String city, String address, Integer capacity, Boolean active) {
        this.code = code;
        this.name = name;
        this.city = city;
        this.address = address;
        this.capacity = capacity;
        this.active = active;
    }

    // Método de conveniencia para mantener sincronizada la relación bidireccional
    public void addEvent(Event event) {
        this.events.add(event);
        // event.setVenue(this); <- Se asignará cuando implementemos Event
    }

    // Getters
    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getCity() { return city; }
    public String getAddress() { return address; }
    public Integer getCapacity() { return capacity; }
    public Boolean getActive() { return active; }
    public List<Event> getEvents() { return events; }
}