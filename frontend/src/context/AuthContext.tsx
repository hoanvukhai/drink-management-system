// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Dùng cái này thay cho next/router
import { jwtDecode } from 'jwt-decode';
import type { ReactNode } from 'react';

interface User {
  userId: number;
  username: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // <-- Hook điều hướng của React Router

  useEffect(() => {
    console.debug('[Auth] init - checking token');
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        setUser(decoded);
        console.debug('[Auth] token decoded', decoded);
      } catch (error) {
        console.error('[Auth] Invalid token', error);
        localStorage.removeItem('accessToken');
      }
    }
    setIsLoading(false);
    console.debug('[Auth] init - isLoading set to false');
  }, []);

  const login = useCallback((token: string) => {
    localStorage.setItem('accessToken', token);
    const decoded = jwtDecode<User>(token);
    setUser(decoded);
    // Sau khi login, đảm bảo trạng thái loading được tắt
    setIsLoading(false);
    // Điều hướng sau khi login thành công
    // Thực hiện điều hướng trong microtask để đảm bảo `setUser` đã cập nhật context
    Promise.resolve().then(() => {
      if (decoded.role === 'ADMIN') navigate('/admin');
      else if (decoded.role === 'MANAGER') navigate('/orderhistory');
      else navigate('/order'); // Employee về trang bán hàng (khớp với sidebar của bạn)
    });
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const value = useMemo(
    () => ({ user, login, logout, isAuthenticated: !!user, isLoading }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};