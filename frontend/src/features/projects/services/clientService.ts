import apiClient from '../../../api/apiClient';
import type { PagedResponse } from '../../../shared/types/common.types';
import type { Client, CreateClientRequest, UpdateClientRequest } from '../types/project.types';

export const clientService = {
  getAll: async (page = 0, size = 20): Promise<PagedResponse<Client>> => {
    const response = await apiClient.get('/clients', { params: { page, size } });
    return response.data;
  },

  getAllActive: async (): Promise<Client[]> => {
    const response = await apiClient.get('/clients/active');
    return response.data;
  },

  getById: async (id: string): Promise<Client> => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },

  create: async (data: CreateClientRequest): Promise<Client> => {
    const response = await apiClient.post('/clients', data);
    return response.data;
  },

  update: async (id: string, data: UpdateClientRequest): Promise<Client> => {
    const response = await apiClient.put(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },
};
