package com.pulsepass.pulsepass.controller;

import com.pulsepass.pulsepass.dto.response.ArtistResponseDto;
import com.pulsepass.pulsepass.service.ArtistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArtistResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.findById(id));
    }

    @GetMapping("/by-stage-name")
    public ResponseEntity<ArtistResponseDto> getByStageName(@RequestParam String stageName) {
        return ResponseEntity.ok(artistService.findByStageName(stageName));
    }

    @GetMapping("/active")
    public ResponseEntity<List<ArtistResponseDto>> getActiveArtists() {
        return ResponseEntity.ok(artistService.findActiveArtists());
    }
}