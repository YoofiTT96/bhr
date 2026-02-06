export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string>;
  timestamp: string;
}
