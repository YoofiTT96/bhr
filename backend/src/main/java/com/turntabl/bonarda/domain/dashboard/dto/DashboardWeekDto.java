package com.turntabl.bonarda.domain.dashboard.dto;

import com.turntabl.bonarda.domain.event.dto.CompanyEventDto;
import com.turntabl.bonarda.domain.timeoff.dto.TimeOffRequestDto;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DashboardWeekDto {
    private List<CompanyEventDto> upcomingEvents;
    private List<TimeOffRequestDto> approvedTimeOff;
}
