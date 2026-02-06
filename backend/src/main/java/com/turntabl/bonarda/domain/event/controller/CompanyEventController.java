package com.turntabl.bonarda.domain.event.controller;

import com.turntabl.bonarda.domain.event.dto.CompanyEventDto;
import com.turntabl.bonarda.domain.event.dto.CreateEventRequest;
import com.turntabl.bonarda.domain.event.dto.UpdateEventRequest;
import com.turntabl.bonarda.domain.event.service.CompanyEventService;
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

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class CompanyEventController {

    private final CompanyEventService companyEventService;

    @GetMapping
    @PreAuthorize("hasAuthority('EVENT_READ')")
    public ResponseEntity<Page<CompanyEventDto>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(companyEventService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('EVENT_READ')")
    public ResponseEntity<CompanyEventDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(companyEventService.getById(id));
    }

    @GetMapping("/week")
    @PreAuthorize("hasAuthority('EVENT_READ')")
    public ResponseEntity<List<CompanyEventDto>> getEventsForWeek(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ResponseEntity.ok(companyEventService.getEventsForDateRange(
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('EVENT_CREATE')")
    public ResponseEntity<CompanyEventDto> create(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(companyEventService.create(currentUser.getPublicId(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('EVENT_UPDATE')")
    public ResponseEntity<CompanyEventDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEventRequest request) {
        return ResponseEntity.ok(companyEventService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('EVENT_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        companyEventService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
