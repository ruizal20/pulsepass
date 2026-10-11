package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.dto.response.ArtistResponseDto;
import java.util.List;

public interface ArtistService {
    ArtistResponseDto findById(Long id);
    ArtistResponseDto findByStageName(String stageName);
    List<ArtistResponseDto> findActiveArtists();
}

