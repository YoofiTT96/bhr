import apiClient from '../../../api/apiClient';
import type { PagedResponse } from '../../../shared/types/common.types';
import type {
  Timesheet,
  CreateTimesheetRequest,
  UpdateTimesheetEntriesRequest,
  ReviewTimesheetRequest,
} from '../types/attendance.types';

export const attendanceService = {
  createOrGetTimesheet: async (data: CreateTimesheetRequest): Promise<Timesheet> => {
    const response = await apiClient.post('/timesheets', data);
    return response.data;
  },

  updateEntries: async (id: string, data: UpdateTimesheetEntriesRequest): Promise<Timesheet> => {
    const response = await apiClient.put(`/timesheets/${id}/entries`, data);
    return response.data;
  },

  clockIn: async (): Promise<Timesheet> => {
    const response = await apiClient.post('/timesheets/clock-in');
    return response.data;
  },

  clockOut: async (): Promise<Timesheet> => {
    const response = await apiClient.post('/timesheets/clock-out');
    return response.data;
  },

  submitTimesheet: async (id: string): Promise<Timesheet> => {
    const response = await apiClient.put(`/timesheets/${id}/submit`);
    return response.data;
  },

  reviewTimesheet: async (id: string, data: ReviewTimesheetRequest): Promise<Timesheet> => {
    const response = await apiClient.put(`/timesheets/${id}/review`, data);
    return response.data;
  },

  getMyTimesheets: async (): Promise<Timesheet[]> => {
    const response = await apiClient.get('/timesheets/me');
    return response.data;
  },

  getCurrentTimesheet: async (): Promise<Timesheet | null> => {
    const response = await apiClient.get('/timesheets/me/current');
    if (response.status === 204) return null;
    return response.data;
  },

  getTimesheet: async (id: string): Promise<Timesheet> => {
    const response = await apiClient.get(`/timesheets/${id}`);
    return response.data;
  },

  getTeamTimesheets: async (): Promise<Timesheet[]> => {
    const response = await apiClient.get('/timesheets/team');
    return response.data;
  },

  getAllTimesheets: async (page = 0, size = 20): Promise<PagedResponse<Timesheet>> => {
    const response = await apiClient.get('/timesheets', { params: { page, size } });
    return response.data;
  },
};
