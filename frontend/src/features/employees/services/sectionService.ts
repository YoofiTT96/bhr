import apiClient from '../../../api/apiClient';
import type {
  EmployeeSection,
  SectionField,
  CreateSectionRequest,
  UpdateSectionRequest,
  CreateSectionFieldRequest,
  UpdateSectionFieldRequest,
} from '../types/section.types';

export const sectionService = {
  // Section operations
  getAll: async (activeOnly = true): Promise<EmployeeSection[]> => {
    const response = await apiClient.get('/sections', { params: { activeOnly } });
    return response.data;
  },

  getById: async (id: string): Promise<EmployeeSection> => {
    const response = await apiClient.get(`/sections/${id}`);
    return response.data;
  },

  getByName: async (name: string): Promise<EmployeeSection> => {
    const response = await apiClient.get(`/sections/by-name/${name}`);
    return response.data;
  },

  getFields: async (sectionId: string): Promise<SectionField[]> => {
    const response = await apiClient.get(`/sections/${sectionId}/fields`);
    return response.data;
  },

  getVisible: async (employeeId: string): Promise<EmployeeSection[]> => {
    const response = await apiClient.get('/sections/visible', { params: { employeeId } });
    return response.data;
  },

  createSection: async (request: CreateSectionRequest): Promise<EmployeeSection> => {
    const response = await apiClient.post('/sections', request);
    return response.data;
  },

  updateSection: async (id: string, request: UpdateSectionRequest): Promise<EmployeeSection> => {
    const response = await apiClient.put(`/sections/${id}`, request);
    return response.data;
  },

  deleteSection: async (id: string): Promise<void> => {
    await apiClient.delete(`/sections/${id}`);
  },

  // Field operations
  createField: async (sectionId: string, request: CreateSectionFieldRequest): Promise<SectionField> => {
    const response = await apiClient.post(`/sections/${sectionId}/fields`, request);
    return response.data;
  },

  updateField: async (fieldId: string, request: UpdateSectionFieldRequest): Promise<SectionField> => {
    const response = await apiClient.put(`/sections/fields/${fieldId}`, request);
    return response.data;
  },

  deleteField: async (fieldId: string): Promise<void> => {
    await apiClient.delete(`/sections/fields/${fieldId}`);
  },
};
