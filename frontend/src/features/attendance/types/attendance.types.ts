export type TimesheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface TimesheetEntry {
  id: string;
  entryDate: string;
  clockIn?: string | null;
  clockOut?: string | null;
  hours: number;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  weekStart: string;
  status: TimesheetStatus;
  totalHours: number;
  entries?: TimesheetEntry[];
  submittedAt?: string | null;
  reviewerName?: string | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface CreateTimesheetRequest {
  weekStart: string;
}

export interface TimesheetEntryRequest {
  entryDate: string;
  clockIn?: string | null;
  clockOut?: string | null;
  hours: number;
}

export interface UpdateTimesheetEntriesRequest {
  entries: TimesheetEntryRequest[];
}

export interface ReviewTimesheetRequest {
  decision: 'APPROVED' | 'REJECTED';
  note?: string;
}
