export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type ProjectAssignmentRole = 'LEAD' | 'MEMBER';

// --- Client ---
export interface Client {
  id: string;
  name: string;
  industry?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  website?: string | null;
  notes?: string | null;
  isActive: boolean;
  projectCount: number;
}

export interface CreateClientRequest {
  name: string;
  industry?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  notes?: string;
}

export interface UpdateClientRequest {
  name?: string;
  industry?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  notes?: string;
  isActive?: boolean;
}

// --- Project ---
export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  budget?: number | null;
  memberCount: number;
  totalHours: number;
  assignments?: ProjectAssignment[];
}

export interface CreateProjectRequest {
  name: string;
  clientId: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

// --- Assignment ---
export interface ProjectAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  role: ProjectAssignmentRole;
  assignedAt: string;
  hoursLogged: number;
}

export interface AssignEmployeeRequest {
  employeeId: string;
  role?: ProjectAssignmentRole;
}

// --- Time Log ---
export interface ProjectTimeLog {
  id: string;
  projectId: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  logDate: string;
  hours: number;
  description?: string | null;
}

export interface CreateTimeLogRequest {
  projectId: string;
  logDate: string;
  hours: number;
  description?: string;
}
