package com.turntabl.bonarda.domain.timesheet.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class TimesheetEntryDto {
    private String id;
    private String entryDate;
    private String clockIn;
    private String clockOut;
    private BigDecimal hours;
}
