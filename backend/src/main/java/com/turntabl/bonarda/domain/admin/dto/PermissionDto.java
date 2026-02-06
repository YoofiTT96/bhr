package com.turntabl.bonarda.domain.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PermissionDto {

    private String id;
    private String name;
    private String resource;
    private String action;
    private String description;
}
