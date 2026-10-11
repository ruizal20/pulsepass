package com.pulsepass.pulsepass.mapper;

import com.pulsepass.pulsepass.domain.Ticket;
import com.pulsepass.pulsepass.dto.response.TicketResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {EventMapper.class})
public interface TicketMapper {
    TicketResponseDto toDto(Ticket ticket);
    List<TicketResponseDto> toDtoList(List<Ticket> tickets);
}