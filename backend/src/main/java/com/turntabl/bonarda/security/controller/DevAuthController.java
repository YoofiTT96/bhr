package com.turntabl.bonarda.security.controller;

import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.employee.model.EmployeeStatus;
import com.turntabl.bonarda.domain.employee.model.Permission;
import com.turntabl.bonarda.domain.employee.model.Role;
import com.turntabl.bonarda.domain.employee.repository.EmployeeRepository;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import com.turntabl.bonarda.security.UserPrincipal;
import com.turntabl.bonarda.security.dto.AuthResponse;
import com.turntabl.bonarda.security.dto.DevLoginRequest;
import com.turntabl.bonarda.security.jwt.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Dev-only authentication controller.
 * Allows login by selecting an employee public ID without real credentials.
 * Only active when the "dev" profile is enabled.
 */
@RestController
@RequestMapping("/api/v1/auth")
@Profile("dev")
@RequiredArgsConstructor
public class DevAuthController {

    private final EmployeeRepository employeeRepository;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/dev-login")
    public ResponseEntity<AuthResponse> devLogin(@Valid @RequestBody DevLoginRequest request) {
        UUID publicId = UUID.fromString(request.getEmployeeId());
        Employee employee = employeeRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "publicId", publicId));

        if (employee.getStatus() == EmployeeStatus.TERMINATED
                || employee.getStatus() == EmployeeStatus.INACTIVE) {
            throw new BadRequestException("Cannot login as a terminated or inactive employee");
        }

        UserPrincipal principal = UserPrincipal.from(employee);
        String token = tokenProvider.generateToken(principal);

        Set<String> roleNames = employee.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        Set<String> permissionNames = employee.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .collect(Collectors.toSet());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .employeeId(employee.getPublicId().toString())
                .email(employee.getEmail())
                .name(employee.getFullName())
                .roles(roleNames)
                .permissions(permissionNames)
                .build());
    }

    @GetMapping("/dev-employees")
    public ResponseEntity<List<Map<String, Object>>> listEmployeesForLogin() {
        List<Map<String, Object>> employees = employeeRepository.findAll().stream()
                .map(e -> Map.<String, Object>of(
                        "id", e.getPublicId().toString(),
                        "name", e.getFullName(),
                        "position", e.getPosition() != null ? e.getPosition() : "",
                        "email", e.getEmail(),
                        "roles", e.getRoles().stream().map(Role::getName).collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(employees);
    }
}
