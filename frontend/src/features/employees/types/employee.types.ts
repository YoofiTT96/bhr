export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface TenureDto {
  years: number;
  months: number;
  days: number;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  position?: string;
  location?: string;
  birthday?: string;
  hireDate: string;
  status: EmployeeStatus;
  microsoftUserId?: string;
  reportsToId?: string;
  reportsToName?: string;
  tenure: TenureDto;
  directReportCount: number;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  position?: string;
  location?: string;
  birthday?: string;
  hireDate: string;
  reportsToId?: string;
  microsoftUserId?: string;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  position?: string;
  location?: string;
  birthday?: string;
  hireDate?: string;
  status?: EmployeeStatus;
  reportsToId?: string;
}

export interface EmployeeHierarchy {
  id: string;
  name: string;
  position?: string;
  email: string;
  directReports: EmployeeHierarchy[];
}

// Bulk Import
export type ImportRowStatus = 'SUCCESS' | 'FAILED' | 'SKIPPED';

export interface ImportRowResult {
  rowNumber: number;
  email: string;
  status: ImportRowStatus;
  employeeId: string | null;
  errors: string[];
}

export interface BulkImportResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  results: ImportRowResult[];
}
