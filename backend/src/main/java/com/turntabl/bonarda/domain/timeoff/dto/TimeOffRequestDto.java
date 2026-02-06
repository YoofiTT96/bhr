package com.turntabl.bonarda.domain.timeoff.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class TimeOffRequestDto {
    private String id;
    private String employeeId;
    private String employeeName;
    private String timeOffTypeId;
    private String timeOffTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean halfDay;
    private String halfDayPeriod;
    private BigDecimal businessDays;
    private String reason;
    private String status;
    private String reviewerId;
    private String reviewerName;
    private String reviewNote;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private String calendarEventId;
    private Boolean calendarSynced;
}
