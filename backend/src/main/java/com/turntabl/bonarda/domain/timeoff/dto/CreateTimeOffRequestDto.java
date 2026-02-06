package com.turntabl.bonarda.domain.timeoff.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateTimeOffRequestDto {

    @NotBlank(message = "Time off type is required")
    private String timeOffTypeId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private Boolean halfDay = false;

    private String halfDayPeriod;

    @Size(max = 1000)
    private String reason;
}
