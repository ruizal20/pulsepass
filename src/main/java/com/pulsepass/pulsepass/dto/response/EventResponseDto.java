package com.pulsepass.pulsepass.dto.response;

import com.pulsepass.pulsepass.domain.EventCategory;
import com.pulsepass.pulsepass.domain.EventStatus;
import java.time.LocalDateTime;
import java.util.List;

public class EventResponseDto {
    private Long id;
    private String eventCode;
    private String title;
    private String description;
    private EventCategory category;
    private EventStatus status;
    private LocalDateTime eventDate;
    private Integer minimumAge;
    private String streamingUrl;
    private VenueResponseDto venue;
    private List<ArtistResponseDto> artists;

    public EventResponseDto() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEventCode() { return eventCode; }
    public void setEventCode(String eventCode) { this.eventCode = eventCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public EventCategory getCategory() { return category; }
    public void setCategory(EventCategory category) { this.category = category; }

    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }

    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

    public Integer getMinimumAge() { return minimumAge; }
    public void setMinimumAge(Integer minimumAge) { this.minimumAge = minimumAge; }

    public String getStreamingUrl() { return streamingUrl; }
    public void setStreamingUrl(String streamingUrl) { this.streamingUrl = streamingUrl; }

    public VenueResponseDto getVenue() { return venue; }
    public void setVenue(VenueResponseDto venue) { this.venue = venue; }

    public List<ArtistResponseDto> getArtists() { return artists; }
    public void setArtists(List<ArtistResponseDto> artists) { this.artists = artists; }
}