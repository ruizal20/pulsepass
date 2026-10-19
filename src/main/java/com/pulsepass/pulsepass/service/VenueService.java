package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.dto.response.VenueResponseDto;
import java.util.List;

public interface VenueService {
    VenueResponseDto findByCode(String code);
    List<VenueResponseDto> findActiveVenues();
}