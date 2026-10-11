package com.pulsepass.pulsepass.mapper;

import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.domain.UserProfile;
import com.pulsepass.pulsepass.dto.response.UserProfileResponseDto;
import com.pulsepass.pulsepass.dto.response.UserResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface UserMapper {
    UserResponseDto toDto(User user);
    UserProfileResponseDto toProfileDto(UserProfile profile);
    List<UserResponseDto> toDtoList(List<User> users);
}