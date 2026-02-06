package com.turntabl.bonarda.domain.project.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class ProjectAssignmentDto {
    private String id;
    private String employeeId;
    private String employeeName;
    private String employeePosition;
    private String role;
    private String assignedAt;
    private BigDecimal hoursLogged;
}
