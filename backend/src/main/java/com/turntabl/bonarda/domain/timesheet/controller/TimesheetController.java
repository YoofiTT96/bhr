package com.turntabl.bonarda.domain.timesheet.controller;

import com.turntabl.bonarda.domain.timesheet.dto.*;
import com.turntabl.bonarda.domain.timesheet.service.TimesheetService;
import com.turntabl.bonarda.security.CurrentUser;
import com.turntabl.bonarda.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/timesheets")
@RequiredArgsConstructor
public class TimesheetController {

    private final TimesheetService timesheetService;

    @PostMapping
    @PreAuthorize("hasAuthority('TIMESHEET_CREATE')")
    public ResponseEntity<TimesheetDto> createOrGetTimesheet(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateTimesheetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(timesheetService.getOrCreateTimesheet(currentUser.getPublicId(), request));
    }

    @PutMapping("/{id}/entries")
    @PreAuthorize("hasAuthority('TIMESHEET_CREATE')")
    public ResponseEntity<TimesheetDto> updateEntries(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody UpdateTimesheetEntriesRequest request) {
        return ResponseEntity.ok(timesheetService.updateEntries(id, request, currentUser.getPublicId()));
    }

    @PostMapping("/clock-in")
    @PreAuthorize("hasAuthority('TIMESHEET_CREATE')")
    public ResponseEntity<TimesheetDto> clockIn(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(timesheetService.clockIn(currentUser.getPublicId()));
    }

    @PostMapping("/clock-out")
    @PreAuthorize("hasAuthority('TIMESHEET_CREATE')")
    public ResponseEntity<TimesheetDto> clockOut(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(timesheetService.clockOut(currentUser.getPublicId()));
    }

    @PutMapping("/{id}/submit")
    @PreAuthorize("hasAuthority('TIMESHEET_SUBMIT')")
    public ResponseEntity<TimesheetDto> submit(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(timesheetService.submit(id, currentUser.getPublicId()));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAuthority('TIMESHEET_APPROVE')")
    public ResponseEntity<TimesheetDto> review(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody ReviewTimesheetRequest request) {
        return ResponseEntity.ok(timesheetService.review(id, currentUser.getPublicId(), request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('TIMESHEET_READ_OWN')")
    public ResponseEntity<List<TimesheetDto>> getMyTimesheets(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(timesheetService.getMyTimesheets(currentUser.getPublicId()));
    }

    @GetMapping("/me/current")
    @PreAuthorize("hasAuthority('TIMESHEET_READ_OWN')")
    public ResponseEntity<TimesheetDto> getCurrentWeekTimesheet(@CurrentUser UserPrincipal currentUser) {
        TimesheetDto dto = timesheetService.getCurrentWeekTimesheet(currentUser.getPublicId());
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/team")
    @PreAuthorize("hasAuthority('TIMESHEET_READ_TEAM')")
    public ResponseEntity<List<TimesheetDto>> getTeamTimesheets(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(timesheetService.getTeamTimesheets(currentUser.getPublicId()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('TIMESHEET_READ_ALL')")
    public ResponseEntity<Page<TimesheetDto>> getAllTimesheets(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(timesheetService.getAllTimesheets(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('TIMESHEET_READ_OWN', 'TIMESHEET_READ_TEAM', 'TIMESHEET_READ_ALL')")
    public ResponseEntity<TimesheetDto> getTimesheet(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser) {
        var permissions = currentUser.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toSet());
        return ResponseEntity.ok(timesheetService.getTimesheetById(id, currentUser.getPublicId(), permissions));
    }
}
