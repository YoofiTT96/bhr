package com.turntabl.bonarda.domain.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class CreateProjectRequest {
    @NotBlank(message = "Project name is required")
    private String name;
    @NotNull(message = "Client ID is required")
    private UUID clientId;
    private String description;
    private String startDate;
    private String endDate;
    private BigDecimal budget;
}
