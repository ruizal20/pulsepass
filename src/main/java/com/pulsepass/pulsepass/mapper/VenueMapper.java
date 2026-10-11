package com.pulsepass.pulsepass.mapper;

import com.pulsepass.pulsepass.domain.Venue;
import com.pulsepass.pulsepass.dto.response.VenueResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, 
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface VenueMapper {

    VenueResponseDto toDto(Venue venue);

    List<VenueResponseDto> toDtoList(List<Venue> venues);
}