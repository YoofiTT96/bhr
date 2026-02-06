package com.turntabl.bonarda.domain.project.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreateTimeLogRequest {
    @NotNull(message = "Project ID is required")
    private UUID projectId;
    @NotNull(message = "Log date is required")
    private LocalDate logDate;
    @NotNull(message = "Hours are required")
    private BigDecimal hours;
    private String description;
}
