package com.turntabl.bonarda.domain.timesheet.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class TimesheetDto {
    private String id;
    private String employeeId;
    private String employeeName;
    private String weekStart;
    private String status;
    private BigDecimal totalHours;
    private List<TimesheetEntryDto> entries;
    private LocalDateTime submittedAt;
    private String reviewerName;
    private String reviewNote;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}
