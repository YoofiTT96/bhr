import apiClient from '../../../api/apiClient';
import type { PagedResponse } from '../../../shared/types/common.types';
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeHierarchy,
  BulkImportResult,
} from '../types/employee.types';
import type { FieldValue } from '../types/section.types';

export const employeeService = {
  getAll: async (page = 0, size = 20): Promise<PagedResponse<Employee>> => {
    const response = await apiClient.get('/employees', { params: { page, size } });
    return response.data;
  },

  getById: async (id: string): Promise<Employee> => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  search: async (query: string): Promise<Employee[]> => {
    const response = await apiClient.get('/employees/search', { params: { q: query } });
    return response.data;
  },

  create: async (data: CreateEmployeeRequest): Promise<Employee> => {
    const response = await apiClient.post('/employees', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEmployeeRequest): Promise<Employee> => {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },

  getHierarchy: async (id: string): Promise<EmployeeHierarchy> => {
    const response = await apiClient.get(`/employees/${id}/hierarchy`);
    return response.data;
  },

  getDirectReports: async (id: string): Promise<Employee[]> => {
    const response = await apiClient.get(`/employees/${id}/direct-reports`);
    return response.data;
  },

  getSectionValues: async (id: string, sectionName: string): Promise<FieldValue[]> => {
    const response = await apiClient.get(`/employees/${id}/sections/${sectionName}`);
    return response.data;
  },

  updateFieldValue: async (
    employeeId: string,
    fieldId: number,
    value: Record<string, unknown>
  ): Promise<FieldValue> => {
    const response = await apiClient.put(`/employees/${employeeId}/fields/${fieldId}`, { value });
    return response.data;
  },

  downloadImportTemplate: async (): Promise<Blob> => {
    const response = await apiClient.get('/employees/import/template', {
      responseType: 'blob',
    });
    return response.data;
  },

  bulkImport: async (file: File): Promise<BulkImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/employees/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
