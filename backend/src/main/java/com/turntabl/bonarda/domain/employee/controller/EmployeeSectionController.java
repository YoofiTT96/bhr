package com.turntabl.bonarda.domain.employee.controller;

import com.turntabl.bonarda.domain.employee.dto.EmployeeSectionDto;
import com.turntabl.bonarda.domain.employee.dto.SectionFieldDto;
import com.turntabl.bonarda.domain.employee.service.EmployeeSectionService;
import com.turntabl.bonarda.security.CurrentUser;
import com.turntabl.bonarda.security.UserPrincipal;
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

    @GetMapping
    public ResponseEntity<List<EmployeeSectionDto>> getAllSections(
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        List<EmployeeSectionDto> sections = activeOnly
                ? sectionService.getAllActiveSections()
                : sectionService.getAllSections();
        return ResponseEntity.ok(sections);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeSectionDto> getSectionWithFields(@PathVariable Long id) {
        return ResponseEntity.ok(sectionService.getSectionWithFields(id));
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
}
