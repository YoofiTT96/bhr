package com.turntabl.bonarda.domain.timesheet.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateTimesheetRequest {

    @NotNull(message = "Week start date is required")
    private LocalDate weekStart;
}
