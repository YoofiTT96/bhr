package com.turntabl.bonarda.domain.project.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class ProjectDto {
    private String id;
    private String clientId;
    private String clientName;
    private String name;
    private String description;
    private String status;
    private String startDate;
    private String endDate;
    private BigDecimal budget;
    private int memberCount;
    private BigDecimal totalHours;
    private List<ProjectAssignmentDto> assignments;
}
