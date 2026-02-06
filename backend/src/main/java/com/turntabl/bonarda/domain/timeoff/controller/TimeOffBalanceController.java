package com.turntabl.bonarda.domain.timeoff.controller;

import com.turntabl.bonarda.domain.timeoff.dto.AdjustBalanceRequest;
import com.turntabl.bonarda.domain.timeoff.dto.TimeOffBalanceDto;
import com.turntabl.bonarda.domain.timeoff.service.TimeOffBalanceService;
import com.turntabl.bonarda.security.CurrentUser;
import com.turntabl.bonarda.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/time-off-balances")
@RequiredArgsConstructor
public class TimeOffBalanceController {

    private final TimeOffBalanceService balanceService;

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('TIME_OFF_BALANCE_READ_OWN')")
    public ResponseEntity<List<TimeOffBalanceDto>> getMyBalances(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(balanceService.getBalancesForEmployee(currentUser.getPublicId(), targetYear));
    }

    @GetMapping("/employees/{employeeId}")
    @PreAuthorize("hasAuthority('TIME_OFF_BALANCE_READ_ALL')")
    public ResponseEntity<List<TimeOffBalanceDto>> getEmployeeBalances(
            @PathVariable UUID employeeId,
            @RequestParam(required = false) Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(balanceService.getBalancesForEmployee(employeeId, targetYear));
    }

    @PutMapping("/employees/{employeeId}/types/{typeId}/adjust")
    @PreAuthorize("hasAuthority('TIME_OFF_BALANCE_ADJUST')")
    public ResponseEntity<TimeOffBalanceDto> adjustBalance(
            @PathVariable UUID employeeId,
            @PathVariable UUID typeId,
            @RequestParam(required = false) Integer year,
            @Valid @RequestBody AdjustBalanceRequest request) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(balanceService.adjustBalance(employeeId, typeId, targetYear, request));
    }
}
