import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectionService } from '../services/sectionService';
import { employeeService } from '../services/employeeService';

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
