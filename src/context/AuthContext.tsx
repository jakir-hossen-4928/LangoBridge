import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  verifyReset: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('auth_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem('auth_user');
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!token && !!user);

  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      const exp = decoded.exp * 1000;
      return Date.now() >= exp;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  useEffect(() => {
    const checkToken = () => {
      if (token && isTokenExpired(token)) {
        console.log('Token expired, logging out');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  useEffect(() => {
    if (user && token && !isTokenExpired(token)) {
      try {
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_token', token);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error saving auth data to localStorage:", error);
      }
    } else {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
    }
    console.log('Auth State:', { user, token, isAuthenticated });
  }, [user, token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        throw new Error(errorData.error || errorData.message || `Login failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.user || !data.token) {
        console.error('Login response missing user or token:', data);
        throw new Error('Login response invalid: Missing user or token');
      }

      if (isTokenExpired(data.token)) {
        throw new Error('Received an expired token');
      }

      setUser(data.user);
      setToken(data.token);
      toast.success('Logged in successfully');
      console.log('Login Success:', { user: data.user, token: data.token });
      return true; // Let LoginPage handle navigation
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
      return false;
    }
  };

  const logout = () => {
    console.log('Logout called');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Reset request failed');
      }

      toast.success('Password reset link sent to your email');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error instanceof Error ? error.message : 'Reset failed');
      throw error;
    }
  };

  const verifyReset = async (token: string, newPassword: string): Promise<void> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Reset verification failed');
      }

      toast.success('Password reset successful. Please login with your new password.');
    } catch (error) {
      console.error('Verify reset error:', error);
      toast.error(error instanceof Error ? error.message : 'Reset verification failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        token,
        login,
        logout,
        resetPassword,
        verifyReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};