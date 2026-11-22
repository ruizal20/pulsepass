package com.pulsepass.pulsepass.mapper;

import com.pulsepass.pulsepass.domain.Event;
import com.pulsepass.pulsepass.dto.response.EventResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {VenueMapper.class, ArtistMapper.class})
public interface EventMapper {
    @Mapping(source = "name", target = "title")
    EventResponseDto toDto(Event event);
    List<EventResponseDto> toDtoList(List<Event> events);
}