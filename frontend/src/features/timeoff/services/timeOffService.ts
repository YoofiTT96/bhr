import apiClient from '../../../api/apiClient';
import type { PagedResponse } from '../../../shared/types/common.types';
import type {
  TimeOffType,
  TimeOffBalance,
  TimeOffRequest,
  CreateTimeOffRequest,
  CreateTimeOffTypeRequest,
  UpdateTimeOffTypeRequest,
  ReviewTimeOffRequest,
  AdjustBalanceRequest,
} from '../types/timeoff.types';

export const timeOffService = {
  // --- Types ---
  getTypes: async (activeOnly = true): Promise<TimeOffType[]> => {
    const response = await apiClient.get('/time-off-types', { params: { activeOnly } });
    return response.data;
  },

  getType: async (id: string): Promise<TimeOffType> => {
    const response = await apiClient.get(`/time-off-types/${id}`);
    return response.data;
  },

  createType: async (data: CreateTimeOffTypeRequest): Promise<TimeOffType> => {
    const response = await apiClient.post('/time-off-types', data);
    return response.data;
  },

  updateType: async (id: string, data: UpdateTimeOffTypeRequest): Promise<TimeOffType> => {
    const response = await apiClient.put(`/time-off-types/${id}`, data);
    return response.data;
  },

  deleteType: async (id: string): Promise<void> => {
    await apiClient.delete(`/time-off-types/${id}`);
  },

  // --- Balances ---
  getMyBalances: async (year?: number): Promise<TimeOffBalance[]> => {
    const response = await apiClient.get('/time-off-balances/me', { params: { year } });
    return response.data;
  },

  getEmployeeBalances: async (employeeId: string, year?: number): Promise<TimeOffBalance[]> => {
    const response = await apiClient.get(`/time-off-balances/employees/${employeeId}`, { params: { year } });
    return response.data;
  },

  adjustBalance: async (
    employeeId: string,
    typeId: string,
    data: AdjustBalanceRequest,
    year?: number
  ): Promise<TimeOffBalance> => {
    const response = await apiClient.put(
      `/time-off-balances/employees/${employeeId}/types/${typeId}/adjust`,
      data,
      { params: { year } }
    );
    return response.data;
  },

  // --- Requests ---
  createRequest: async (data: CreateTimeOffRequest): Promise<TimeOffRequest> => {
    const response = await apiClient.post('/time-off-requests', data);
    return response.data;
  },

  getMyRequests: async (): Promise<TimeOffRequest[]> => {
    const response = await apiClient.get('/time-off-requests/me');
    return response.data;
  },

  getTeamRequests: async (): Promise<TimeOffRequest[]> => {
    const response = await apiClient.get('/time-off-requests/team');
    return response.data;
  },

  getAllRequests: async (page = 0, size = 20): Promise<PagedResponse<TimeOffRequest>> => {
    const response = await apiClient.get('/time-off-requests', { params: { page, size } });
    return response.data;
  },

  getRequest: async (id: string): Promise<TimeOffRequest> => {
    const response = await apiClient.get(`/time-off-requests/${id}`);
    return response.data;
  },

  reviewRequest: async (id: string, data: ReviewTimeOffRequest): Promise<TimeOffRequest> => {
    const response = await apiClient.put(`/time-off-requests/${id}/review`, data);
    return response.data;
  },

  cancelRequest: async (id: string): Promise<TimeOffRequest> => {
    const response = await apiClient.put(`/time-off-requests/${id}/cancel`);
    return response.data;
  },

  // --- Attachments ---
  uploadAttachment: async (requestId: string, file: File): Promise<TimeOffRequest> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/time-off-requests/${requestId}/attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  downloadAttachment: async (requestId: string): Promise<Blob> => {
    const response = await apiClient.get(`/time-off-requests/${requestId}/attachment`, {
      responseType: 'blob',
    });
    return response.data;
  },

  deleteAttachment: async (requestId: string): Promise<void> => {
    await apiClient.delete(`/time-off-requests/${requestId}/attachment`);
  },
};
