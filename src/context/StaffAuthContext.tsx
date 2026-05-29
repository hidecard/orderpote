import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authenticateStaffAccount } from '../lib/db';
import type { StaffAccount, StaffRole } from '../lib/schema';

interface StaffAuthContextType {
  staff: (StaffAccount & { role: StaffRole }) | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<(StaffAccount & { role: StaffRole }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const staffStr = localStorage.getItem('staff');
    if (staffStr) {
      try {
        const staffData = JSON.parse(staffStr);
        setStaff(staffData);
      } catch (error) {
        console.error('Error parsing staff data:', error);
        localStorage.removeItem('staff');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting staff login for:', email);
      const staffData = await authenticateStaffAccount(email, password);
      console.log('Staff data received:', staffData);
      if (staffData) {
        setStaff(staffData);
        localStorage.setItem('staff', JSON.stringify(staffData));
        console.log('Login successful');
        return true;
      }
      console.log('Login failed - no staff data returned');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setStaff(null);
    localStorage.removeItem('staff');
  };

  const hasPermission = (permission: string): boolean => {
    if (!staff) return false;
    // Admin has all permissions
    if (staff.role.name === 'admin') return true;
    // Check if permission exists in role's permissions
    return staff.role.permissions.includes('*') || staff.role.permissions.includes(permission);
  };

  return (
    <StaffAuthContext.Provider value={{ staff, login, logout, isLoading, hasPermission }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
}
