import apiClient from '../../../api/apiClient';
import type { EmployeeSection, SectionField } from '../types/section.types';

export const sectionService = {
  getAll: async (activeOnly = true): Promise<EmployeeSection[]> => {
    const response = await apiClient.get('/sections', { params: { activeOnly } });
    return response.data;
  },

  getById: async (id: number): Promise<EmployeeSection> => {
    const response = await apiClient.get(`/sections/${id}`);
    return response.data;
  },

  getByName: async (name: string): Promise<EmployeeSection> => {
    const response = await apiClient.get(`/sections/by-name/${name}`);
    return response.data;
  },

  getFields: async (sectionId: number): Promise<SectionField[]> => {
    const response = await apiClient.get(`/sections/${sectionId}/fields`);
    return response.data;
  },

  getVisible: async (employeeId: string): Promise<EmployeeSection[]> => {
    const response = await apiClient.get('/sections/visible', { params: { employeeId } });
    return response.data;
  },
};
