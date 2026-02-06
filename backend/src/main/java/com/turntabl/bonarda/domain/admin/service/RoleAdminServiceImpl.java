package com.turntabl.bonarda.domain.admin.service;

import com.turntabl.bonarda.domain.admin.dto.*;
import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.employee.model.Permission;
import com.turntabl.bonarda.domain.employee.model.Role;
import com.turntabl.bonarda.domain.employee.repository.EmployeeRepository;
import com.turntabl.bonarda.domain.employee.repository.PermissionRepository;
import com.turntabl.bonarda.domain.employee.repository.RoleRepository;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RoleAdminServiceImpl implements RoleAdminService {

    private static final Set<String> DEFAULT_ROLES = Set.of("ADMIN", "HR_MANAGER", "MANAGER", "EMPLOYEE");

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .sorted(Comparator.comparing(Role::getName))
                .map(this::toRoleDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleDto getRoleById(UUID publicId) {
        Role role = roleRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "publicId", publicId));
        return toRoleDto(role);
    }

    @Override
    public RoleDto createRole(CreateRoleRequest request) {
        if (roleRepository.existsByName(request.getName())) {
            throw new BadRequestException("Role with name '" + request.getName() + "' already exists");
        }

        Role role = Role.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = resolvePermissions(request.getPermissionIds());
            role.setPermissions(permissions);
        }

        Role saved = roleRepository.save(role);
        return toRoleDto(saved);
    }

    @Override
    public RoleDto updateRole(UUID publicId, UpdateRoleRequest request) {
        Role role = roleRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "publicId", publicId));

        if (request.getName() != null && !request.getName().equals(role.getName())) {
            if (roleRepository.existsByName(request.getName())) {
                throw new BadRequestException("Role with name '" + request.getName() + "' already exists");
            }
            role.setName(request.getName());
        }

        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = resolvePermissions(request.getPermissionIds());
            role.setPermissions(permissions);
        }

        Role saved = roleRepository.save(role);
        return toRoleDto(saved);
    }

    @Override
    public void deleteRole(UUID publicId) {
        Role role = roleRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "publicId", publicId));

        if (DEFAULT_ROLES.contains(role.getName())) {
            throw new BadRequestException("Cannot delete default role '" + role.getName() + "'");
        }

        roleRepository.delete(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionDto> getAllPermissions() {
        return permissionRepository.findAllByOrderByResourceAscActionAsc().stream()
                .map(this::toPermissionDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> getEmployeeRoles(UUID employeePublicId) {
        Employee employee = employeeRepository.findByPublicId(employeePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "publicId", employeePublicId));

        return employee.getRoles().stream()
                .sorted(Comparator.comparing(Role::getName))
                .map(this::toRoleDto)
                .collect(Collectors.toList());
    }

    @Override
    public void assignRolesToEmployee(UUID employeePublicId, AssignRolesRequest request) {
        Employee employee = employeeRepository.findByPublicId(employeePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "publicId", employeePublicId));

        Set<Role> roles = resolveRoles(request.getRoleIds());
        employee.setRoles(roles);
        employeeRepository.save(employee);
    }

    // --- Private helpers ---

    private RoleDto toRoleDto(Role role) {
        List<PermissionDto> permissionDtos = role.getPermissions().stream()
                .sorted(Comparator.comparing(Permission::getResource).thenComparing(Permission::getAction))
                .map(this::toPermissionDto)
                .collect(Collectors.toList());

        return RoleDto.builder()
                .id(role.getPublicId().toString())
                .name(role.getName())
                .description(role.getDescription())
                .createdAt(role.getCreatedAt())
                .permissions(permissionDtos)
                .build();
    }

    private PermissionDto toPermissionDto(Permission permission) {
        return PermissionDto.builder()
                .id(permission.getPublicId().toString())
                .name(permission.getName())
                .resource(permission.getResource())
                .action(permission.getAction())
                .description(permission.getDescription())
                .build();
    }

    private Set<Permission> resolvePermissions(Set<String> permissionIds) {
        Set<UUID> uuids = permissionIds.stream()
                .map(UUID::fromString)
                .collect(Collectors.toSet());

        List<Permission> found = permissionRepository.findByPublicIdIn(uuids);

        if (found.size() != uuids.size()) {
            Set<UUID> foundIds = found.stream()
                    .map(Permission::getPublicId)
                    .collect(Collectors.toSet());
            Set<UUID> missing = uuids.stream()
                    .filter(id -> !foundIds.contains(id))
                    .collect(Collectors.toSet());
            throw new ResourceNotFoundException("Permissions not found: " + missing);
        }

        return new HashSet<>(found);
    }

    private Set<Role> resolveRoles(Set<String> roleIds) {
        Set<UUID> uuids = roleIds.stream()
                .map(UUID::fromString)
                .collect(Collectors.toSet());

        List<Role> found = roleRepository.findByPublicIdIn(uuids);

        if (found.size() != uuids.size()) {
            Set<UUID> foundIds = found.stream()
                    .map(Role::getPublicId)
                    .collect(Collectors.toSet());
            Set<UUID> missing = uuids.stream()
                    .filter(id -> !foundIds.contains(id))
                    .collect(Collectors.toSet());
            throw new ResourceNotFoundException("Roles not found: " + missing);
        }

        return new HashSet<>(found);
    }
}
