package com.turntabl.bonarda.domain.timeoff.controller;

import com.turntabl.bonarda.domain.timeoff.dto.CreateTimeOffTypeRequest;
import com.turntabl.bonarda.domain.timeoff.dto.TimeOffTypeDto;
import com.turntabl.bonarda.domain.timeoff.dto.UpdateTimeOffTypeRequest;
import com.turntabl.bonarda.domain.timeoff.service.TimeOffTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/time-off-types")
@RequiredArgsConstructor
public class TimeOffTypeController {

    private final TimeOffTypeService typeService;

    @GetMapping
    @PreAuthorize("hasAuthority('TIME_OFF_TYPE_READ')")
    public ResponseEntity<List<TimeOffTypeDto>> getTypes(
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        return ResponseEntity.ok(activeOnly ? typeService.getAllActive() : typeService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('TIME_OFF_TYPE_READ')")
    public ResponseEntity<TimeOffTypeDto> getType(@PathVariable UUID id) {
        return ResponseEntity.ok(typeService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('TIME_OFF_TYPE_CREATE')")
    public ResponseEntity<TimeOffTypeDto> createType(
            @Valid @RequestBody CreateTimeOffTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(typeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('TIME_OFF_TYPE_UPDATE')")
    public ResponseEntity<TimeOffTypeDto> updateType(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTimeOffTypeRequest request) {
        return ResponseEntity.ok(typeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('TIME_OFF_TYPE_DELETE')")
    public ResponseEntity<Void> deleteType(@PathVariable UUID id) {
        typeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
