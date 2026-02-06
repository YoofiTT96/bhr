import apiClient from '../../../api/apiClient';
import type { PagedResponse } from '../../../shared/types/common.types';
import type {
  CompanyEvent,
  CreateEventRequest,
  UpdateEventRequest,
  DashboardWeekData,
} from '../types/dashboard.types';

export const dashboardService = {
  getWeekData: async (startDate: string, endDate: string): Promise<DashboardWeekData> => {
    const response = await apiClient.get('/dashboard/week', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

export const eventService = {
  getAll: async (page = 0, size = 20): Promise<PagedResponse<CompanyEvent>> => {
    const response = await apiClient.get('/events', { params: { page, size } });
    return response.data;
  },

  getById: async (id: string): Promise<CompanyEvent> => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  getEventsForWeek: async (startDate: string, endDate: string): Promise<CompanyEvent[]> => {
    const response = await apiClient.get('/events/week', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  create: async (data: CreateEventRequest): Promise<CompanyEvent> => {
    const response = await apiClient.post('/events', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEventRequest): Promise<CompanyEvent> => {
    const response = await apiClient.put(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },
};
