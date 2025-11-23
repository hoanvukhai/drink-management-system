// frontend/src/features/auth/hooks/useAuth.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        setUser(decoded);
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('accessToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (token: string) => {
      localStorage.setItem('accessToken', token);
      const decoded = jwtDecode<User>(token);
      setUser(decoded);
      setIsLoading(false);

      // Navigate based on role - Default to /tables (Sơ đồ bàn)
      setTimeout(() => {
        if (decoded.role === 'ADMIN') {
          navigate('/menu'); // Admin -> Quản lý menu
        } else if (decoded.role === 'MANAGER') {
          navigate('/tables'); // Manager -> Sơ đồ bàn
        } else {
          navigate('/tables'); // Employee -> Sơ đồ bàn
        }
      }, 0);
    },
    [navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading,
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}