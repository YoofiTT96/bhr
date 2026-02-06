import type { TimeOffRequest } from '../../timeoff/types/timeoff.types';

export type EventType = 'MEETING' | 'CELEBRATION' | 'TRAINING' | 'COMPANY_WIDE' | 'SOCIAL' | 'OTHER';

export interface CompanyEvent {
  id: string;
  title: string;
  description?: string | null;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  eventType: EventType;
  createdByEmployeeId?: string | null;
  createdByEmployeeName?: string | null;
  createdAt: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  eventType: EventType;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  eventType?: EventType;
}

export interface DashboardWeekData {
  upcomingEvents: CompanyEvent[];
  approvedTimeOff: TimeOffRequest[];
}
