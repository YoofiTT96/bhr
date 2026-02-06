package com.turntabl.bonarda.domain.timeoff.controller;

import com.turntabl.bonarda.domain.timeoff.dto.CreateTimeOffRequestDto;
import com.turntabl.bonarda.domain.timeoff.dto.ReviewTimeOffRequestDto;
import com.turntabl.bonarda.domain.timeoff.dto.TimeOffRequestDto;
import com.turntabl.bonarda.domain.timeoff.service.TimeOffRequestService;
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
@RequestMapping("/api/v1/time-off-requests")
@RequiredArgsConstructor
public class TimeOffRequestController {

    private final TimeOffRequestService requestService;

    @PostMapping
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_CREATE')")
    public ResponseEntity<TimeOffRequestDto> createRequest(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateTimeOffRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(requestService.create(currentUser.getPublicId(), request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_READ_OWN')")
    public ResponseEntity<List<TimeOffRequestDto>> getMyRequests(
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(requestService.getMyRequests(currentUser.getPublicId()));
    }

    @GetMapping("/team")
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_READ_TEAM')")
    public ResponseEntity<List<TimeOffRequestDto>> getTeamRequests(
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(requestService.getTeamRequests(currentUser.getPublicId()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_READ_ALL')")
    public ResponseEntity<Page<TimeOffRequestDto>> getAllRequests(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(requestService.getAllRequests(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('TIME_OFF_REQUEST_READ_OWN', 'TIME_OFF_REQUEST_READ_TEAM', 'TIME_OFF_REQUEST_READ_ALL')")
    public ResponseEntity<TimeOffRequestDto> getRequest(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser) {
        var permissions = currentUser.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toSet());
        return ResponseEntity.ok(requestService.getById(id,
                currentUser.getPublicId(), permissions));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_APPROVE')")
    public ResponseEntity<TimeOffRequestDto> reviewRequest(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody ReviewTimeOffRequestDto request) {
        return ResponseEntity.ok(requestService.review(id, currentUser.getPublicId(), request));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_CREATE')")
    public ResponseEntity<TimeOffRequestDto> cancelRequest(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(requestService.cancel(id, currentUser.getPublicId()));
    }
}
