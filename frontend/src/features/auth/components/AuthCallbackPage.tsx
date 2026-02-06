import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Parse key=value pairs from the URL hash fragment.
 * e.g. "#token=abc&error=xyz" → { token: "abc", error: "xyz" }
 */
function parseHashParams(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return params;
  for (const part of raw.split('&')) {
    const [key, ...rest] = part.split('=');
    if (key) params[key] = decodeURIComponent(rest.join('='));
  }
  return params;
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read from URL fragment (hash) — never sent to servers or logged
    const params = parseHashParams(window.location.hash);
    const token = params.token;
    const errorCode = params.error;
    const errorDescription = params.error_description;

    // Clear the hash immediately so the token isn't visible in the address bar
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    if (token) {
      loginWithToken(token)
        .then(() => navigate('/', { replace: true }))
        .catch(() => setError('Failed to load user profile. Please try again.'));
    } else if (errorCode) {
      setError(errorDescription || 'Authentication failed. Please try again.');
    } else {
      setError('Invalid callback. No token or error received.');
    }
  }, [navigate, loginWithToken]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Sign In Failed</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-sm text-gray-500">Completing sign in...</p>
      </div>
    </div>
  );
}
