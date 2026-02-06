package com.turntabl.bonarda.domain.timeoff.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTimeOffTypeRequest {

    @Size(max = 100)
    private String name;

    private String description;

    @Min(0)
    private Integer defaultDaysPerYear;

    private Boolean carryOverAllowed;

    @Min(0)
    private Integer maxCarryOverDays;

    private Boolean requiresApproval;

    private Boolean isActive;

    private Boolean isUnlimited;
}
