package com.pulsepass.pulsepass.service.impl;

import com.pulsepass.pulsepass.domain.Artist;
import com.pulsepass.pulsepass.dto.response.ArtistResponseDto;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.ArtistMapper;
import com.pulsepass.pulsepass.repository.ArtistRepository;
import com.pulsepass.pulsepass.service.ArtistService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ArtistServiceImpl implements ArtistService {

    private final ArtistRepository artistRepository;
    private final ArtistMapper artistMapper;

    public ArtistServiceImpl(ArtistRepository artistRepository, ArtistMapper artistMapper) {
        this.artistRepository = artistRepository;
        this.artistMapper = artistMapper;
    }

    @Override
    public ArtistResponseDto findById(Long id) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artista no encontrado con ID: " + id));
        return artistMapper.toDto(artist);
    }

    @Override
    public ArtistResponseDto findByStageName(String stageName) {
        Artist artist = artistRepository.findByStageName(stageName)
                .orElseThrow(() -> new ResourceNotFoundException("Artista no encontrado con nombre: " + stageName));
        return artistMapper.toDto(artist);
    }

    @Override
    public List<ArtistResponseDto> findActiveArtists() {
        return artistRepository.findByActiveTrueOrderByStageNameAsc()
                .stream()
                .map(artistMapper::toDto)
                .toList();
    }
}