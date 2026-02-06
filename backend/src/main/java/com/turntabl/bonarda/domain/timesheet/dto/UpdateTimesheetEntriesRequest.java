package com.turntabl.bonarda.domain.timesheet.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateTimesheetEntriesRequest {

    @NotNull(message = "Entries are required")
    @Valid
    private List<TimesheetEntryRequest> entries;
}
