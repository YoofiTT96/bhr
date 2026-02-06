import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthUser } from '../types/auth.types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (employeeId: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService
        .getCurrentUser()
        .then((data) => {
          setUser({
            employeeId: data.employeeId,
            email: data.email,
            name: data.name,
            roles: data.roles,
            permissions: data.permissions,
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (employeeId: string) => {
    const data = await authService.devLogin({ employeeId });
    localStorage.setItem('token', data.token);
    setUser({
      employeeId: data.employeeId,
      email: data.email,
      name: data.name,
      roles: data.roles,
      permissions: data.permissions,
    });
  }, []);

  const loginWithToken = useCallback(async (token: string) => {
    localStorage.setItem('token', token);
    try {
      const data = await authService.getCurrentUser();
      setUser({
        employeeId: data.employeeId,
        email: data.email,
        name: data.name,
        roles: data.roles,
        permissions: data.permissions,
      });
    } catch (err) {
      localStorage.removeItem('token');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const hasPermission = useCallback(
    (permission: string) => {
      return user?.permissions.includes(permission) ?? false;
    },
    [user],
  );

  const hasRole = useCallback(
    (role: string) => {
      return user?.roles.includes(role) ?? false;
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithToken,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
