package com.turntabl.bonarda.domain.project.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class ProjectTimeLogDto {
    private String id;
    private String projectId;
    private String projectName;
    private String employeeId;
    private String employeeName;
    private String logDate;
    private BigDecimal hours;
    private String description;
}
