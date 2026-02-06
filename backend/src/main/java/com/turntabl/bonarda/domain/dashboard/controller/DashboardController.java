package com.turntabl.bonarda.domain.dashboard.controller;

import com.turntabl.bonarda.domain.dashboard.dto.DashboardWeekDto;
import com.turntabl.bonarda.domain.event.service.CompanyEventService;
import com.turntabl.bonarda.domain.timeoff.service.TimeOffRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final CompanyEventService companyEventService;
    private final TimeOffRequestService timeOffRequestService;

    @GetMapping("/week")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DashboardWeekDto> getWeekData(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        DashboardWeekDto dashboard = DashboardWeekDto.builder()
                .upcomingEvents(companyEventService.getEventsForDateRange(start, end))
                .approvedTimeOff(timeOffRequestService.getApprovedRequestsForDateRange(start, end))
                .build();

        return ResponseEntity.ok(dashboard);
    }
}
