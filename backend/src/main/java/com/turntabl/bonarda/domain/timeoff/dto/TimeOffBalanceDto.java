package com.turntabl.bonarda.domain.timeoff.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class TimeOffBalanceDto {
    private String id;
    private String employeeId;
    private String timeOffTypeId;
    private String timeOffTypeName;
    private Integer year;
    private BigDecimal totalAllocated;
    private BigDecimal used;
    private BigDecimal pending;
    private BigDecimal carryOver;
    private BigDecimal remaining;
    private Boolean isUnlimited;
}
