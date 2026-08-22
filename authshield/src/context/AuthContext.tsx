import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, TokenDetails, AuditLog } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  tokenDetails: TokenDetails | null;
  auditLogs: AuditLog[];
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, role?: 'user' | 'admin') => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  fetchAuditLogs: () => Promise<void>;
  seedDemo: () => Promise<any>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Check initial session on app mount
  const checkSession = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Includes HTTP-Only cookie
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setTokenDetails({
          storage: 'HTTP-Only Secure Cookie',
          sameSite: 'Lax',
          httpOnly: true,
          expiresIn: '30d',
        });
      } else {
        setUser(null);
      }
    } catch (err: any) {
      console.warn('Session check warning:', err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.message || 'Authentication failed';
        setError(msg);
        return { success: false, message: msg };
      }

      setUser(data.user);
      if (data.tokenDetails) {
        setTokenDetails(data.tokenDetails);
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Network error during login';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (name: string, email: string, password: string, role: 'user' | 'admin' = 'user') => {
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.message || 'Registration failed';
        setError(msg);
        return { success: false, message: msg };
      }

      setUser(data.user);
      if (data.tokenDetails) {
        setTokenDetails(data.tokenDetails);
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Network error during registration';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout request error:', err);
    } finally {
      setUser(null);
      setTokenDetails(null);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/auth/audit-logs', {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.logs) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.warn('Audit log fetch error:', err);
    }
  };

  const seedDemo = async () => {
    try {
      const res = await fetch('/api/auth/demo-seed', {
        method: 'POST',
        credentials: 'include',
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        tokenDetails,
        auditLogs,
        login,
        register,
        logout,
        clearError,
        fetchAuditLogs,
        seedDemo,
        refreshUser: checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
