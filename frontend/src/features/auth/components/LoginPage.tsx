import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService, type SsoConfig } from '../services/authService';
import apiClient from '../../../api/apiClient';

interface DevEmployee {
  id: string;
  name: string;
  position: string;
  email: string;
  roles: string[];
}

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<DevEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [ssoConfig, setSsoConfig] = useState<SsoConfig | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch SSO config and dev employees
  useEffect(() => {
    authService.getSsoConfig()
      .then(setSsoConfig)
      .catch(() => setSsoConfig({ ssoEnabled: false }));

    apiClient
      .get<DevEmployee[]>('/auth/dev-employees')
      .then(({ data }) => setEmployees(data))
      .catch(() => {})
      .finally(() => setLoadingEmployees(false));
  }, []);

  const handleLogin = async () => {
    if (!selectedId) return;
    setError(null);
    setIsLoggingIn(true);
    try {
      await login(selectedId);
      navigate('/');
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSsoLogin = () => {
    const backendBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1').replace('/api/v1', '');
    window.location.href = `${backendBaseUrl}${ssoConfig?.ssoUrl}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900"><span className="text-blue-500">Bonarda</span>HR</h1>
            <p className="text-sm text-gray-500 mt-1">Human Resources Management</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Microsoft SSO button */}
          {ssoConfig?.ssoEnabled && (
            <>
              <button
                onClick={handleSsoLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[#0078d4] text-white text-sm font-medium rounded-lg hover:bg-[#106ebe] transition-colors mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                Sign in with Microsoft
              </button>

              {employees.length > 0 && (
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-gray-400">or</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Dev login */}
          {employees.length > 0 && (
            <>
              {!ssoConfig?.ssoEnabled && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                  <p className="text-xs text-amber-700 font-medium">Development Mode</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Select an employee to log in as. In production, Microsoft SSO will be used.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700 mb-1">
                    {ssoConfig?.ssoEnabled ? 'Dev login' : 'Log in as'}
                  </label>
                  <select
                    id="employee-select"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingEmployees}
                  >
                    <option value="">Select an employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.position || 'No position'} ({emp.roles.join(', ')})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={!selectedId || isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <LogIn size={16} />
                  {isLoggingIn ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </>
          )}

          {/* No login options available */}
          {!loadingEmployees && employees.length === 0 && !ssoConfig?.ssoEnabled && (
            <p className="text-sm text-gray-500 text-center">
              No login methods available. Configure Azure AD SSO or enable the dev profile.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
