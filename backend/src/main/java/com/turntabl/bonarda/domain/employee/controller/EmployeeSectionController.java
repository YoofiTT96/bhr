package com.turntabl.bonarda.domain.employee.controller;

import com.turntabl.bonarda.domain.employee.dto.*;
import com.turntabl.bonarda.domain.employee.service.EmployeeSectionService;
import com.turntabl.bonarda.security.CurrentUser;
import com.turntabl.bonarda.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/sections")
@RequiredArgsConstructor
public class EmployeeSectionController {

    private final EmployeeSectionService sectionService;

    // ========== Read Operations ==========

    @GetMapping
    public ResponseEntity<List<EmployeeSectionDto>> getAllSections(
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        List<EmployeeSectionDto> sections = activeOnly
                ? sectionService.getAllActiveSections()
                : sectionService.getAllSections();
        return ResponseEntity.ok(sections);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SECTION_READ')")
    public ResponseEntity<EmployeeSectionDto> getSectionById(@PathVariable UUID id) {
        return ResponseEntity.ok(sectionService.getSectionByPublicId(id));
    }

    @GetMapping("/by-name/{name}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EmployeeSectionDto> getSectionByName(@PathVariable String name) {
        return ResponseEntity.ok(sectionService.getSectionByNameWithFields(name));
    }

    @GetMapping("/{id}/fields")
    public ResponseEntity<List<SectionFieldDto>> getSectionFields(@PathVariable Long id) {
        return ResponseEntity.ok(sectionService.getFieldsBySectionId(id));
    }

    @GetMapping("/visible")
    public ResponseEntity<List<EmployeeSectionDto>> getVisibleSections(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam UUID employeeId) {
        Set<String> permissions = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return ResponseEntity.ok(sectionService.getVisibleSections(
                currentUser.getPublicId(), employeeId, permissions));
    }

    // ========== Section CRUD ==========

    @PostMapping
    @PreAuthorize("hasAuthority('SECTION_CREATE')")
    public ResponseEntity<EmployeeSectionDto> createSection(
            @Valid @RequestBody CreateSectionRequest request) {
        return ResponseEntity.ok(sectionService.createSection(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SECTION_UPDATE')")
    public ResponseEntity<EmployeeSectionDto> updateSection(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSectionRequest request) {
        return ResponseEntity.ok(sectionService.updateSection(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SECTION_DELETE')")
    public ResponseEntity<Void> deleteSection(@PathVariable UUID id) {
        sectionService.deleteSection(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Field CRUD ==========

    @PostMapping("/{sectionId}/fields")
    @PreAuthorize("hasAuthority('SECTION_UPDATE')")
    public ResponseEntity<SectionFieldDto> createField(
            @PathVariable UUID sectionId,
            @Valid @RequestBody CreateSectionFieldRequest request) {
        return ResponseEntity.ok(sectionService.createField(sectionId, request));
    }

    @PutMapping("/fields/{fieldId}")
    @PreAuthorize("hasAuthority('SECTION_UPDATE')")
    public ResponseEntity<SectionFieldDto> updateField(
            @PathVariable UUID fieldId,
            @Valid @RequestBody UpdateSectionFieldRequest request) {
        return ResponseEntity.ok(sectionService.updateField(fieldId, request));
    }

    @DeleteMapping("/fields/{fieldId}")
    @PreAuthorize("hasAuthority('SECTION_UPDATE')")
    public ResponseEntity<Void> deleteField(@PathVariable UUID fieldId) {
        sectionService.deleteField(fieldId);
        return ResponseEntity.noContent().build();
    }
}
