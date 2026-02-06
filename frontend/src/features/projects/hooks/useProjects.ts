import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services/clientService';
import { projectService } from '../services/projectService';
import type {
  CreateClientRequest,
  UpdateClientRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  AssignEmployeeRequest,
  CreateTimeLogRequest,
} from '../types/project.types';

// ===================== Client Hooks =====================

export function useClients(page = 0, size = 20) {
  return useQuery({
    queryKey: ['clients', page, size],
    queryFn: () => clientService.getAll(page, size),
  });
}

export function useActiveClients() {
  return useQuery({
    queryKey: ['clients', 'active'],
    queryFn: () => clientService.getAllActive(),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientService.getById(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientRequest) => clientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientRequest }) =>
      clientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// ===================== Project Hooks =====================

export function useProjects(page = 0, size = 20) {
  return useQuery({
    queryKey: ['projects', page, size],
    queryFn: () => projectService.getAll(page, size),
  });
}

export function useMyProjects() {
  return useQuery({
    queryKey: ['projects', 'me'],
    queryFn: () => projectService.getMyProjects(),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ===================== Assignment Hooks =====================

export function useProjectAssignments(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'assignments'],
    queryFn: () => projectService.getAssignments(projectId),
    enabled: !!projectId,
  });
}

export function useAssignEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: AssignEmployeeRequest }) =>
      projectService.assignEmployee(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useRemoveAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, assignmentId }: { projectId: string; assignmentId: string }) =>
      projectService.removeAssignment(projectId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ===================== Time Log Hooks =====================

export function useProjectTimeLogs(projectId: string) {
  return useQuery({
    queryKey: ['project-time-logs', projectId],
    queryFn: () => projectService.getProjectLogs(projectId),
    enabled: !!projectId,
  });
}

export function useMyTimeLogs() {
  return useQuery({
    queryKey: ['project-time-logs', 'me'],
    queryFn: () => projectService.getMyLogs(),
  });
}

export function useLogTime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimeLogRequest) => projectService.logTime(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-time-logs'] });
    },
  });
}

export function useUpdateTimeLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTimeLogRequest }) =>
      projectService.updateLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-time-logs'] });
    },
  });
}

export function useDeleteTimeLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.deleteLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-time-logs'] });
    },
  });
}
