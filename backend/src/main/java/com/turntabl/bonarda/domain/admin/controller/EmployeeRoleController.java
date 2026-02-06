package com.turntabl.bonarda.domain.admin.controller;

import com.turntabl.bonarda.domain.admin.dto.AssignRolesRequest;
import com.turntabl.bonarda.domain.admin.dto.RoleDto;
import com.turntabl.bonarda.domain.admin.service.RoleAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/employees/{employeeId}/roles")
@RequiredArgsConstructor
public class EmployeeRoleController {

    private final RoleAdminService roleAdminService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public ResponseEntity<List<RoleDto>> getEmployeeRoles(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(roleAdminService.getEmployeeRoles(employeeId));
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ROLE_ASSIGN')")
    public ResponseEntity<Void> assignRoles(
            @PathVariable UUID employeeId,
            @Valid @RequestBody AssignRolesRequest request) {
        roleAdminService.assignRolesToEmployee(employeeId, request);
        return ResponseEntity.noContent().build();
    }
}
