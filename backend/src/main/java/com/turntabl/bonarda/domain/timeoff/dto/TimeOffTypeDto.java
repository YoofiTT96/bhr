package com.turntabl.bonarda.domain.timeoff.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TimeOffTypeDto {
    private String id;
    private String name;
    private String description;
    private Integer defaultDaysPerYear;
    private Boolean carryOverAllowed;
    private Integer maxCarryOverDays;
    private Boolean requiresApproval;
    private Boolean isActive;
    private Boolean isUnlimited;
}
