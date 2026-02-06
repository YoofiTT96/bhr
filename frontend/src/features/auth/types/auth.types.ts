export interface AuthResponse {
  token: string;
  tokenType: string;
  employeeId: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export interface AuthUser {
  employeeId: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export interface DevLoginRequest {
  employeeId: string;
}
