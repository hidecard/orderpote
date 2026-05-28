/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../lib/schema';
import { getUserByEmail, createUser, updateUserSellerStatus, getStoreByUserId, getDevicesByStoreId, createDevice, updateDevice, recordDeviceUsage } from '../lib/db';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  becomeSeller: () => Promise<void>;
}

// Helper function to get device identifier
function getDeviceIdentifier(): string {
  let deviceId = localStorage.getItem('orderpote_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('orderpote_device_id', deviceId);
  }
  return deviceId;
}

// Helper function to get device type
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' | 'other' {
  const userAgent = navigator.userAgent;
  if (/Mobile|Android|iPhone/i.test(userAgent)) {
    return 'mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    return 'tablet';
  } else if (/Desktop|Windows|Mac|Linux/i.test(userAgent)) {
    return 'desktop';
  }
  return 'other';
}

// Helper function to get device name
function getDeviceName(): string {
  const userAgent = navigator.userAgent;
  if (/iPhone/i.test(userAgent)) return 'iPhone';
  if (/iPad/i.test(userAgent)) return 'iPad';
  if (/Android/i.test(userAgent)) return 'Android Device';
  if (/Windows/i.test(userAgent)) return 'Windows PC';
  if (/Mac/i.test(userAgent)) return 'Mac';
  if (/Linux/i.test(userAgent)) return 'Linux PC';
  return 'Unknown Device';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('orderpote_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading] = useState(false);

  const login = async (email: string, password: string): Promise<User> => {
    const user = await getUserByEmail(email);
    if (user && user.password === password) {
      setUser(user);
      localStorage.setItem('orderpote_user', JSON.stringify(user));
      
      // Track device usage for sellers
      try {
        const store = await getStoreByUserId(user.id);
        
        if (store) {
          const deviceIdentifier = getDeviceIdentifier();
          const deviceType = getDeviceType();
          const deviceName = getDeviceName();
          
          // Check if device exists
          const devices = await getDevicesByStoreId(store.id);
          let device = devices.find(d => d.device_identifier === deviceIdentifier);
          
          if (!device) {
            // Create new device
            device = await createDevice({
              store_id: store.id,
              device_name: deviceName,
              device_type: deviceType,
              device_identifier: deviceIdentifier,
              last_active: new Date().toISOString(),
              status: 'active',
            });
          } else {
            // Update device last active time
            await updateDevice(device.id, {
              last_active: new Date().toISOString(),
              status: 'active',
            });
          }
          
          // Record device usage with account type
          await recordDeviceUsage({
            device_id: device.id,
            user_id: user.id,
            account_type: 'seller',
            login_time: new Date().toISOString(),
            user_agent: navigator.userAgent,
          });
          
          // Store current device usage ID for logout tracking
          localStorage.setItem('orderpote_current_usage_id', device.id);
        }
      } catch (error) {
        console.error('Error tracking device usage:', error);
        // Don't block login if device tracking fails
      }
      
      return user;
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
    // Record logout time if we have a device usage ID
    const deviceId = localStorage.getItem('orderpote_current_usage_id');
    if (deviceId) {
      try {
        // In a real implementation, we'd need to track the specific usage ID
        // For now, we'll just remove the device ID
        localStorage.removeItem('orderpote_current_usage_id');
      } catch (error) {
        console.error('Error recording logout:', error);
      }
    }
    
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
