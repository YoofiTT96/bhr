package com.turntabl.bonarda.domain.project.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AssignEmployeeRequest {
    @NotNull(message = "Employee ID is required")
    private UUID employeeId;
    private String role;
}
