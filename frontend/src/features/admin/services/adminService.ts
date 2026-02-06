import apiClient from '../../../api/apiClient';
import type {
  RoleDto,
  PermissionDto,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRolesRequest,
} from '../types/admin.types';

export const adminService = {
  // --- Roles ---
  getRoles: async (): Promise<RoleDto[]> => {
    const response = await apiClient.get('/admin/roles');
    return response.data;
  },

  getRole: async (id: string): Promise<RoleDto> => {
    const response = await apiClient.get(`/admin/roles/${id}`);
    return response.data;
  },

  createRole: async (data: CreateRoleRequest): Promise<RoleDto> => {
    const response = await apiClient.post('/admin/roles', data);
    return response.data;
  },

  updateRole: async (id: string, data: UpdateRoleRequest): Promise<RoleDto> => {
    const response = await apiClient.put(`/admin/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/roles/${id}`);
  },

  // --- Permissions ---
  getPermissions: async (): Promise<PermissionDto[]> => {
    const response = await apiClient.get('/admin/permissions');
    return response.data;
  },

  // --- Employee roles ---
  getEmployeeRoles: async (employeeId: string): Promise<RoleDto[]> => {
    const response = await apiClient.get(`/admin/employees/${employeeId}/roles`);
    return response.data;
  },

  assignRoles: async (employeeId: string, data: AssignRolesRequest): Promise<void> => {
    await apiClient.put(`/admin/employees/${employeeId}/roles`, data);
  },
};
