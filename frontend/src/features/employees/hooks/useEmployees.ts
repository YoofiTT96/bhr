import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '../services/employeeService';
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from '../types/employee.types';

export function useEmployees(page = 0, size = 20) {
  return useQuery({
    queryKey: ['employees', page, size],
    queryFn: () => employeeService.getAll(page, size),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
  });
}

export function useEmployeeSearch(query: string) {
  return useQuery({
    queryKey: ['employees', 'search', query],
    queryFn: () => employeeService.search(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
      employeeService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useEmployeeHierarchy(id: string) {
  return useQuery({
    queryKey: ['employee-hierarchy', id],
    queryFn: () => employeeService.getHierarchy(id),
    enabled: !!id,
  });
}

export function useDirectReports(id: string) {
  return useQuery({
    queryKey: ['direct-reports', id],
    queryFn: () => employeeService.getDirectReports(id),
    enabled: !!id,
  });
}

export function useBulkImportEmployees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => employeeService.bulkImport(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
