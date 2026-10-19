package com.pulsepass.pulsepass.domain;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "artists")
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stage_name", nullable = false, unique = true, length = 100)
    private String stageName;

    @Column(name = "country", nullable = false, length = 100)
    private String country;

    @Column(name = "genre", nullable = false, length = 100)
    private String genre;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    // Relación N:M con Event (Un artista participa en muchos eventos)
    // El 'mappedBy' indica que la entidad 'Event' es la propietaria del mapeo de la tabla intermedia (event_artists)
    @ManyToMany(mappedBy = "artists")
    private Set<Event> events = new HashSet<>();

    // Constructor vacío obligatorio para JPA
    protected Artist() {
    }

    // Constructor con campos principales
    public Artist(String stageName, String country, String genre, Boolean active) {
        this.stageName = stageName;
        this.country = country;
        this.genre = genre;
        this.active = active;
    }

    // Getters
    public Long getId() { return id; }
    public String getStageName() { return stageName; }
    public String getCountry() { return country; }
    public String getGenre() { return genre; }
    public Boolean getActive() { return active; }
    public Set<Event> getEvents() { return events; }
}