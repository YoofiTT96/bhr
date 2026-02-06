import apiClient from '../../../api/apiClient';
import type { AuthResponse, DevLoginRequest } from '../types/auth.types';

export interface SsoConfig {
  ssoEnabled: boolean;
  ssoUrl?: string;
}

export const authService = {
  devLogin: async (request: DevLoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/dev-login', request);
    return data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.get<AuthResponse>('/auth/me');
    return data;
  },

  getSsoConfig: async (): Promise<SsoConfig> => {
    const { data } = await apiClient.get<SsoConfig>('/auth/sso-config');
    return data;
  },
};
