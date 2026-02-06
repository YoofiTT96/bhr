package com.turntabl.bonarda.domain.timeoff.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTimeOffTypeRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    private String description;

    @NotNull(message = "Default days per year is required")
    @Min(0)
    private Integer defaultDaysPerYear;

    private Boolean carryOverAllowed = false;

    @Min(0)
    private Integer maxCarryOverDays = 0;

    private Boolean requiresApproval = true;

    private Boolean isUnlimited = false;
}
