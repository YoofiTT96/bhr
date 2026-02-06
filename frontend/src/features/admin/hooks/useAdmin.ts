import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { CreateRoleRequest, UpdateRoleRequest, AssignRolesRequest } from '../types/admin.types';

// --- Role queries ---
export function useRoles() {
  return useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => adminService.getRoles(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ['admin', 'roles', id],
    queryFn: () => adminService.getRole(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => adminService.getPermissions(),
    staleTime: 10 * 60 * 1000,
  });
}

// --- Role mutations ---
export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleRequest) => adminService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      adminService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
  });
}

// --- Employee role queries/mutations ---
export function useEmployeeRoles(employeeId: string) {
  return useQuery({
    queryKey: ['admin', 'employee-roles', employeeId],
    queryFn: () => adminService.getEmployeeRoles(employeeId),
    enabled: !!employeeId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAssignRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: string; data: AssignRolesRequest }) =>
      adminService.assignRoles(employeeId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'employee-roles', variables.employeeId] });
    },
  });
}
