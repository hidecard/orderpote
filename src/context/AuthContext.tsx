import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../lib/schema';
import { getUserByEmail, createUser, updateUserSellerStatus } from '../lib/db';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  becomeSeller: () => Promise<void>;
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

  const login = async (email: string, password: string) => {
    const user = await getUserByEmail(email);
    if (user && user.password === password) {
      setUser(user);
      localStorage.setItem('orderpote_user', JSON.stringify(user));
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const newUser = await createUser({ email, password, name, is_seller: false });
    setUser(newUser);
    localStorage.setItem('orderpote_user', JSON.stringify(newUser));
  };

  const becomeSeller = async () => {
    if (!user) return;
    await updateUserSellerStatus(user.id, true);
    setUser({ ...user, is_seller: true });
    localStorage.setItem('orderpote_user', JSON.stringify({ ...user, is_seller: true }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('orderpote_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, becomeSeller }}>
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
