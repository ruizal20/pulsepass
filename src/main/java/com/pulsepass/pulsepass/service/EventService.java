package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.dto.response.EventResponseDto;
import com.pulsepass.pulsepass.dto.request.CreateEventRequest;
import java.util.List;

public interface EventService {
    EventResponseDto create(CreateEventRequest request);
    EventResponseDto findByCode(String eventCode);
    List<EventResponseDto> findPublishedEvents();
    EventResponseDto publish(String eventCode);
    EventResponseDto addArtist(String eventCode, Long artistId);
    List<EventResponseDto> findByArtist(String stageName);
}