package com.turntabl.bonarda.domain.admin.service;

import com.turntabl.bonarda.domain.admin.dto.*;

import java.util.List;
import java.util.UUID;

public interface RoleAdminService {

    List<RoleDto> getAllRoles();

    RoleDto getRoleById(UUID publicId);

    RoleDto createRole(CreateRoleRequest request);

    RoleDto updateRole(UUID publicId, UpdateRoleRequest request);

    void deleteRole(UUID publicId);

    List<PermissionDto> getAllPermissions();

    List<RoleDto> getEmployeeRoles(UUID employeePublicId);

    void assignRolesToEmployee(UUID employeePublicId, AssignRolesRequest request);
}
