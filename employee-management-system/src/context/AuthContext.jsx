import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if admin is logged in on initial load / refresh
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAdmin(data.admin);
      } else {
        setAdmin(null);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Admin Login
  const login = async (email, password) => {
    try {
      setError(null);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      setAdmin(data.admin);
      return { success: true, message: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Setup Initial Admin
  const setupAdmin = async (email, password, name) => {
    try {
      setError(null);
      const res = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Setup failed.');
      }

      setAdmin(data.admin);
      return { success: true, message: data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Admin Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        loading,
        error,
        setError,
        login,
        setupAdmin,
        logout,
        refreshAuth: checkAuthStatus,
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

export default AuthContext;
