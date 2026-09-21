package com.pulsepass.pulsepass.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_code", nullable = false, unique = true, length = 50)
    private String eventCode;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private EventCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private EventStatus status;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Column(name = "minimum_age", nullable = false)
    private Integer minimumAge = 0;

    @Column(name = "streaming_url", length = 500)
    private String streamingUrl;

    // Relación N:1 con Venue (Muchos eventos ocurren en un Venue)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    // Relación N:M con Artist (Un evento tiene muchos artistas; aquí definimos la tabla intermedia event_artists)
    @ManyToMany
    @JoinTable(
        name = "event_artists",
        joinColumns = @JoinColumn(name = "event_id"),
        inverseJoinColumns = @JoinColumn(name = "artist_id")
    )
    private Set<Artist> artists = new HashSet<>();

    // Constructor vacío obligatorio para JPA
    protected Event() {
    }

    public Event(String eventCode, String name, String description, EventCategory category, 
                 EventStatus status, LocalDateTime eventDate, Integer minimumAge, Venue venue) {
        this.eventCode = eventCode;
        this.name = name;
        this.description = description;
        this.category = category;
        this.status = status;
        this.eventDate = eventDate;
        this.minimumAge = minimumAge;
        this.venue = venue;
    }

    // Método de conveniencia para asociar artistas y mantener la bidireccionalidad sincronizada
    public void addArtist(Artist artist) {
        this.artists.add(artist);
        artist.getEvents().add(this);
    }

    // Getters
    public Long getId() { return id; }
    public String getEventCode() { return eventCode; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public EventCategory getCategory() { return category; }
    public EventStatus  getEventStatus(){ return status; }
    public EventStatus getStatus() { return status; }
    public LocalDateTime getEventDate() { return eventDate; }
    public Integer getMinimumAge() { return minimumAge; }
    public String getStreamingUrl() { return streamingUrl; }
    public Venue getVenue() { return venue; }
    public Set<Artist> getArtists() { return artists; }
}