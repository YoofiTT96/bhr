package com.turntabl.bonarda.security.controller;

import com.turntabl.bonarda.config.AzureAdProperties;
import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.employee.model.Permission;
import com.turntabl.bonarda.domain.employee.model.Role;
import com.turntabl.bonarda.domain.employee.repository.EmployeeRepository;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import com.turntabl.bonarda.security.UserPrincipal;
import com.turntabl.bonarda.security.dto.AuthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final EmployeeRepository employeeRepository;

    @Autowired
    private AzureAdProperties azureAdProperties;

    @GetMapping("/sso-config")
    public ResponseEntity<Map<String, Object>> getSsoConfig() {
        boolean ssoEnabled = azureAdProperties != null && azureAdProperties.isEnabled();
        Map<String, Object> config = new LinkedHashMap<>();
        config.put("ssoEnabled", ssoEnabled);
        if (ssoEnabled) {
            config.put("ssoUrl", "/oauth2/authorization/azure");
        }
        return ResponseEntity.ok(config);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        Employee employee = employeeRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", principal.getId()));

        Set<String> roleNames = employee.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        Set<String> permissionNames = employee.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .collect(Collectors.toSet());

        return ResponseEntity.ok(AuthResponse.builder()
                .employeeId(employee.getPublicId().toString())
                .email(employee.getEmail())
                .name(employee.getFullName())
                .roles(roleNames)
                .permissions(permissionNames)
                .build());
    }
}
