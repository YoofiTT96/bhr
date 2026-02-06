package com.turntabl.bonarda.domain.timesheet.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class TimesheetEntryRequest {

    @NotNull(message = "Entry date is required")
    private LocalDate entryDate;

    private LocalTime clockIn;

    private LocalTime clockOut;

    @NotNull(message = "Hours is required")
    @DecimalMin(value = "0.0", message = "Hours must be >= 0")
    @DecimalMax(value = "24.0", message = "Hours must be <= 24")
    private BigDecimal hours;
}
