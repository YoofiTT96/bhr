package com.turntabl.bonarda.domain.employee.controller;

import com.turntabl.bonarda.domain.employee.dto.*;
import com.turntabl.bonarda.domain.employee.service.BulkImportService;
import com.turntabl.bonarda.domain.employee.service.EmployeeService;
import com.turntabl.bonarda.domain.employee.service.EmployeeSectionService;
import com.turntabl.bonarda.security.CurrentUser;
import com.turntabl.bonarda.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeSectionService sectionService;
    private final BulkImportService bulkImportService;

    @PostMapping
    @PreAuthorize("hasAuthority('EMPLOYEE_CREATE')")
    public ResponseEntity<EmployeeDto> createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeDto created = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('EMPLOYEE_READ_ALL', 'EMPLOYEE_READ_TEAM')")
    public ResponseEntity<Page<EmployeeDto>> getAllEmployees(
            @PageableDefault(size = 20, sort = "lastName") Pageable pageable) {
        return ResponseEntity.ok(employeeService.getAllEmployees(pageable));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('EMPLOYEE_READ_ALL', 'EMPLOYEE_READ_TEAM')")
    public ResponseEntity<List<EmployeeDto>> searchEmployees(
            @RequestParam String q) {
        return ResponseEntity.ok(employeeService.searchEmployees(q));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('EMPLOYEE_READ_TEAM', 'EMPLOYEE_READ')")
    public ResponseEntity<EmployeeDto> getEmployee(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<EmployeeDto> updateEmployee(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEmployeeRequest request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('EMPLOYEE_DELETE')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable UUID id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/hierarchy")
    @PreAuthorize("hasAnyAuthority('EMPLOYEE_READ_ALL', 'EMPLOYEE_READ_TEAM')")
    public ResponseEntity<EmployeeHierarchyDto> getEmployeeHierarchy(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getEmployeeHierarchy(id));
    }

    @GetMapping("/{id}/direct-reports")
    @PreAuthorize("hasAnyAuthority('EMPLOYEE_READ_ALL', 'EMPLOYEE_READ_TEAM')")
    public ResponseEntity<List<EmployeeDto>> getDirectReports(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getDirectReports(id));
    }

    @GetMapping("/{id}/sections/{sectionName}")
    @PreAuthorize("hasAnyAuthority('EMPLOYEE_READ_ALL', 'EMPLOYEE_READ_TEAM', 'EMPLOYEE_READ')")
    public ResponseEntity<List<FieldValueDto>> getEmployeeSectionValues(
            @PathVariable UUID id,
            @PathVariable String sectionName,
            @CurrentUser UserPrincipal currentUser) {
        Set<String> permissions = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        if (!sectionService.canViewSection(sectionName, currentUser.getPublicId(), id, permissions)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(employeeService.getEmployeeFieldValues(id, sectionName));
    }

    @PutMapping("/{id}/fields/{fieldId}")
    @PreAuthorize("hasAuthority('EMPLOYEE_UPDATE')")
    public ResponseEntity<FieldValueDto> updateFieldValue(
            @PathVariable UUID id,
            @PathVariable Long fieldId,
            @Valid @RequestBody UpdateFieldValueRequest request) {
        return ResponseEntity.ok(employeeService.updateFieldValue(id, fieldId, request));
    }

    @GetMapping("/import/template")
    @PreAuthorize("hasAuthority('EMPLOYEE_CREATE')")
    public ResponseEntity<byte[]> downloadImportTemplate() {
        byte[] template = bulkImportService.generateTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employee_import_template.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(template);
    }

    @PostMapping("/import")
    @PreAuthorize("hasAuthority('EMPLOYEE_CREATE')")
    public ResponseEntity<BulkImportResult> importEmployees(
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(bulkImportService.importEmployees(file));
    }
}
