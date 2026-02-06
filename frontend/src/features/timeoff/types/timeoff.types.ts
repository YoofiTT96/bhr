export type TimeOffRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type HalfDayPeriod = 'MORNING' | 'AFTERNOON';

export interface TimeOffType {
  id: string;
  name: string;
  description?: string;
  defaultDaysPerYear: number;
  carryOverAllowed: boolean;
  maxCarryOverDays: number;
  requiresApproval: boolean;
  isActive: boolean;
  isUnlimited: boolean;
}

export interface TimeOffBalance {
  id: string;
  employeeId: string;
  timeOffTypeId: string;
  timeOffTypeName: string;
  year: number;
  totalAllocated: number;
  used: number;
  pending: number;
  carryOver: number;
  remaining: number;
  isUnlimited: boolean;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  timeOffTypeId: string;
  timeOffTypeName: string;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  halfDayPeriod?: HalfDayPeriod;
  businessDays: number;
  reason?: string;
  status: TimeOffRequestStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
  calendarEventId?: string;
  calendarSynced?: boolean;
}

export interface CreateTimeOffRequest {
  timeOffTypeId: string;
  startDate: string;
  endDate: string;
  halfDay?: boolean;
  halfDayPeriod?: HalfDayPeriod;
  reason?: string;
}

export interface ReviewTimeOffRequest {
  decision: 'APPROVED' | 'REJECTED';
  note?: string;
}

export interface AdjustBalanceRequest {
  adjustment: number;
  reason?: string;
}
