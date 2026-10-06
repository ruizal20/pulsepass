package com.pulsepass.pulsepass.mapper;

import com.pulsepass.pulsepass.domain.Artist;
import com.pulsepass.pulsepass.dto.response.ArtistResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ArtistMapper {
    ArtistResponseDto toDto(Artist artist);
    List<ArtistResponseDto> toDtoList(List<Artist> artists);
}