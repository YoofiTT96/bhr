export interface RoleDto {
  id: string;
  name: string;
  description: string;
  permissions: PermissionDto[];
  createdAt: string;
}

export interface PermissionDto {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface AssignRolesRequest {
  roleIds: string[];
}
