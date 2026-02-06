import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendanceService';
import type {
  CreateTimesheetRequest,
  UpdateTimesheetEntriesRequest,
  ReviewTimesheetRequest,
} from '../types/attendance.types';

// --- Query hooks ---
export function useMyTimesheets() {
  return useQuery({
    queryKey: ['timesheets', 'me'],
    queryFn: () => attendanceService.getMyTimesheets(),
  });
}

export function useCurrentTimesheet() {
  return useQuery({
    queryKey: ['timesheets', 'me', 'current'],
    queryFn: () => attendanceService.getCurrentTimesheet(),
    staleTime: 60 * 1000,
  });
}

export function useTimesheet(id: string) {
  return useQuery({
    queryKey: ['timesheets', id],
    queryFn: () => attendanceService.getTimesheet(id),
    enabled: !!id,
  });
}

export function useTeamTimesheets() {
  return useQuery({
    queryKey: ['timesheets', 'team'],
    queryFn: () => attendanceService.getTeamTimesheets(),
  });
}

export function useAllTimesheets(page = 0, size = 20) {
  return useQuery({
    queryKey: ['timesheets', 'all', page, size],
    queryFn: () => attendanceService.getAllTimesheets(page, size),
  });
}

// --- Mutation hooks ---
export function useCreateOrGetTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimesheetRequest) => attendanceService.createOrGetTimesheet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}

export function useUpdateEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimesheetEntriesRequest }) =>
      attendanceService.updateEntries(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => attendanceService.clockIn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => attendanceService.clockOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}

export function useSubmitTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attendanceService.submitTimesheet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}

export function useReviewTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewTimesheetRequest }) =>
      attendanceService.reviewTimesheet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}
