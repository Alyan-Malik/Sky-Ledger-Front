import { createContext, useState, useContext, useEffect, useMemo, useCallback, ReactNode } from 'react';
import api from '../api/axios';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (userData: any) => Promise<any>;
  login: (credentials: any) => Promise<any>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (data: any) => Promise<any>;
  resendVerification: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'token';
const SESSION_ID_KEY = 'session_id';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      const { data } = await api.get<User>('/user');
      setUser(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(SESSION_ID_KEY);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (credentials: any) => {
    const { data } = await api.post('/login', credentials);
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(SESSION_ID_KEY, data.session_id);
    setUser(data.user);
    localStorage.removeItem('unverified_email');
    return data;
  }, []);

  const register = useCallback(async (userData: any) => {
    const { data } = await api.post('/register', userData);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
      setUser(null);
      window.location.replace('/login');
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const { data } = await api.post('/send-password-reset-link', { email });
    return data;
  }, []);

  const resetPassword = useCallback(async (resetData: any) => {
    const { data } = await api.post('/reset-password', resetData);
    return data;
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    const { data } = await api.post('/resend-verification', { email });
    return data;
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    resendVerification
  }), [user, loading, register, login, logout, forgotPassword, resetPassword, resendVerification]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};