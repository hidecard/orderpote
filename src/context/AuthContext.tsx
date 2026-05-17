import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/schema';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => void;
  register: (phone: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('orderpote_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string) => {
    // TODO: Implement actual login with OTP verification
    // For now, mock login
    const mockUser: User = {
      id: 'user-123',
      phone,
      name: 'Test User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(mockUser);
    localStorage.setItem('orderpote_user', JSON.stringify(mockUser));
  };

  const register = async (phone: string, name: string) => {
    // TODO: Implement actual registration with OTP verification
    // For now, mock registration
    const newUser: User = {
      id: `user-${Date.now()}`,
      phone,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('orderpote_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('orderpote_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
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
