package com.turntabl.bonarda.domain.employee.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class EmployeeSectionDto {

    private String id;  // publicId as string
    private String name;
    private String displayName;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private String requiredPermission;
    private List<SectionFieldDto> fields;
}
