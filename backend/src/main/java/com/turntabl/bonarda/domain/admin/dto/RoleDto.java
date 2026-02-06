package com.turntabl.bonarda.domain.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class RoleDto {

    private String id;
    private String name;
    private String description;
    private List<PermissionDto> permissions;
    private LocalDateTime createdAt;
}
