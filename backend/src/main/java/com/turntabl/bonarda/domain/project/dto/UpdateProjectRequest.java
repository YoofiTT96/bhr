package com.turntabl.bonarda.domain.project.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class UpdateProjectRequest {
    private String name;
    private UUID clientId;
    private String description;
    private String status;
    private String startDate;
    private String endDate;
    private BigDecimal budget;
}
