import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeOffService } from '../services/timeOffService';
import type {
  CreateTimeOffRequest,
  CreateTimeOffTypeRequest,
  UpdateTimeOffTypeRequest,
  ReviewTimeOffRequest,
} from '../types/timeoff.types';

// --- Type hooks ---
export function useTimeOffTypes(activeOnly = true) {
  return useQuery({
    queryKey: ['time-off-types', activeOnly],
    queryFn: () => timeOffService.getTypes(activeOnly),
    staleTime: 10 * 60 * 1000,
  });
}

// --- Balance hooks ---
export function useMyBalances(year?: number) {
  return useQuery({
    queryKey: ['time-off-balances', 'me', year],
    queryFn: () => timeOffService.getMyBalances(year),
    staleTime: 2 * 60 * 1000,
  });
}

export function useEmployeeBalances(employeeId: string, year?: number) {
  return useQuery({
    queryKey: ['time-off-balances', employeeId, year],
    queryFn: () => timeOffService.getEmployeeBalances(employeeId, year),
    enabled: !!employeeId,
    staleTime: 2 * 60 * 1000,
  });
}

// --- Request hooks ---
export function useMyTimeOffRequests() {
  return useQuery({
    queryKey: ['time-off-requests', 'me'],
    queryFn: () => timeOffService.getMyRequests(),
  });
}

export function useTeamTimeOffRequests() {
  return useQuery({
    queryKey: ['time-off-requests', 'team'],
    queryFn: () => timeOffService.getTeamRequests(),
  });
}

export function useAllTimeOffRequests(page = 0, size = 20) {
  return useQuery({
    queryKey: ['time-off-requests', 'all', page, size],
    queryFn: () => timeOffService.getAllRequests(page, size),
  });
}

// --- Mutation hooks ---
export function useCreateTimeOffRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimeOffRequest) => timeOffService.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      queryClient.invalidateQueries({ queryKey: ['time-off-balances'] });
    },
  });
}

export function useReviewTimeOffRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewTimeOffRequest }) =>
      timeOffService.reviewRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      queryClient.invalidateQueries({ queryKey: ['time-off-balances'] });
    },
  });
}

export function useCancelTimeOffRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeOffService.cancelRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      queryClient.invalidateQueries({ queryKey: ['time-off-balances'] });
    },
  });
}

// --- Type mutation hooks ---
export function useCreateTimeOffType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimeOffTypeRequest) => timeOffService.createType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-types'] });
    },
  });
}

export function useUpdateTimeOffType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimeOffTypeRequest }) =>
      timeOffService.updateType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-types'] });
    },
  });
}

export function useDeleteTimeOffType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeOffService.deleteType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-types'] });
    },
  });
}

// --- Attachment hooks ---
export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, file }: { requestId: string; file: File }) =>
      timeOffService.uploadAttachment(requestId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => timeOffService.deleteAttachment(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
    },
  });
}
