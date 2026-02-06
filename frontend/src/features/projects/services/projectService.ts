import apiClient from '../../../api/apiClient';
import type { PagedResponse } from '../../../shared/types/common.types';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectAssignment,
  AssignEmployeeRequest,
  ProjectTimeLog,
  CreateTimeLogRequest,
} from '../types/project.types';

export const projectService = {
  // --- Projects ---
  getAll: async (page = 0, size = 20): Promise<PagedResponse<Project>> => {
    const response = await apiClient.get('/projects', { params: { page, size } });
    return response.data;
  },

  getMyProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get('/projects/me');
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  // --- Assignments ---
  getAssignments: async (projectId: string): Promise<ProjectAssignment[]> => {
    const response = await apiClient.get(`/projects/${projectId}/assignments`);
    return response.data;
  },

  assignEmployee: async (projectId: string, data: AssignEmployeeRequest): Promise<ProjectAssignment> => {
    const response = await apiClient.post(`/projects/${projectId}/assignments`, data);
    return response.data;
  },

  removeAssignment: async (projectId: string, assignmentId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/assignments/${assignmentId}`);
  },

  // --- Time Logs ---
  getProjectLogs: async (projectId: string): Promise<ProjectTimeLog[]> => {
    const response = await apiClient.get(`/project-time-logs/project/${projectId}`);
    return response.data;
  },

  getMyLogs: async (): Promise<ProjectTimeLog[]> => {
    const response = await apiClient.get('/project-time-logs/me');
    return response.data;
  },

  logTime: async (data: CreateTimeLogRequest): Promise<ProjectTimeLog> => {
    const response = await apiClient.post('/project-time-logs', data);
    return response.data;
  },

  updateLog: async (id: string, data: CreateTimeLogRequest): Promise<ProjectTimeLog> => {
    const response = await apiClient.put(`/project-time-logs/${id}`, data);
    return response.data;
  },

  deleteLog: async (id: string): Promise<void> => {
    await apiClient.delete(`/project-time-logs/${id}`);
  },
};
