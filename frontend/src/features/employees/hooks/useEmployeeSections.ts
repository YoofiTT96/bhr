import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectionService } from '../services/sectionService';
import { employeeService } from '../services/employeeService';
import type {
  CreateSectionRequest,
  UpdateSectionRequest,
  CreateSectionFieldRequest,
  UpdateSectionFieldRequest,
} from '../types/section.types';

export function useSections(activeOnly = true) {
  return useQuery({
    queryKey: ['sections', activeOnly],
    queryFn: () => sectionService.getAll(activeOnly),
    staleTime: 10 * 60 * 1000,
  });
}

export function useVisibleSections(employeeId: string) {
  return useQuery({
    queryKey: ['sections', 'visible', employeeId],
    queryFn: () => sectionService.getVisible(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSectionWithFields(name: string) {
  return useQuery({
    queryKey: ['section', name],
    queryFn: () => sectionService.getByName(name),
    enabled: !!name,
    staleTime: 10 * 60 * 1000,
  });
}

export function useEmployeeSectionValues(employeeId: string, sectionName: string) {
  return useQuery({
    queryKey: ['employee-section-values', employeeId, sectionName],
    queryFn: () => employeeService.getSectionValues(employeeId, sectionName),
    enabled: !!employeeId && !!sectionName,
  });
}

export function useUpdateFieldValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      fieldId,
      value,
    }: {
      employeeId: string;
      fieldId: number;
      value: Record<string, unknown>;
    }) => employeeService.updateFieldValue(employeeId, fieldId, value),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employee-section-values', variables.employeeId],
      });
    },
  });
}

// Section CRUD mutations
export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateSectionRequest) => sectionService.createSection(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateSectionRequest }) =>
      sectionService.updateSection(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sectionService.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
}

// Field CRUD mutations
export function useCreateField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, request }: { sectionId: string; request: CreateSectionFieldRequest }) =>
      sectionService.createField(sectionId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
}

export function useUpdateField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fieldId, request }: { fieldId: string; request: UpdateSectionFieldRequest }) =>
      sectionService.updateField(fieldId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
}

export function useDeleteField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fieldId: string) => sectionService.deleteField(fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
  });
}
