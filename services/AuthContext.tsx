import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { SalesPerson, User } from '../types';
import { salesRoster as mockSalesRoster } from './mockData';

interface AuthContextType {
  user: User | null;
  loginSales: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  loginAdmin: (pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  salesRoster: SalesPerson[];
  addSalesPerson: (data: Omit<SalesPerson, 'id' | 'status' | 'lineUserId'>) => void;
  removeSalesPerson: (salesId: string) => void;
  toggleSalesStatus: (salesId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [salesRoster, setSalesRoster] = useState<SalesPerson[]>(mockSalesRoster);

  const loginSales = useCallback(async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const salesUser = salesRoster.find(s => s.email === email && s.password === pass);
            if (salesUser) {
                setUser({
                    type: 'sales',
                    name: salesUser.name,
                    details: salesUser
                });
                resolve({ success: true, message: 'Login successful!' });
            } else {
                resolve({ success: false, message: 'Invalid email or password' });
            }
        }, 500);
    });
  }, [salesRoster]);

  const loginAdmin = useCallback(async (pass: string): Promise<{ success: boolean; message: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (pass === 'admin') {
                setUser({ type: 'admin', name: 'Admin' });
                resolve({ success: true, message: 'Admin login successful!' });
            } else {
                resolve({ success: false, message: 'Invalid admin password' });
            }
        }, 500);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addSalesPerson = useCallback((data: Omit<SalesPerson, 'id' | 'status' | 'lineUserId'>) => {
    const newSales: SalesPerson = {
        ...data,
        id: `sales_${Date.now()}`,
        status: 'offline',
        lineUserId: `user_${data.name.toLowerCase().replace(' ', '')}`
    };
    setSalesRoster(prev => [...prev, newSales]);
  }, []);

  const removeSalesPerson = useCallback((salesId: string) => {
    if (window.confirm("Are you sure you want to remove this salesperson?")) {
        setSalesRoster(prev => prev.filter(s => s.id !== salesId));
    }
  }, []);

  const toggleSalesStatus = useCallback((salesId: string) => {
    setSalesRoster(prevRoster => {
        const newRoster = prevRoster.map(s => {
            if (s.id === salesId) {
                return { ...s, status: s.status === 'online' ? 'offline' : 'online' };
            }
            return s;
        });

        if (user && user.details && user.details.id === salesId) {
            const updatedSalesPerson = newRoster.find(s => s.id === salesId);
            if (updatedSalesPerson) {
                setUser({
                    ...user,
                    details: updatedSalesPerson,
                });
            }
        }
        return newRoster;
    });
  }, [user]);


  return (
    <AuthContext.Provider value={{ user, loginSales, loginAdmin, logout, salesRoster, addSalesPerson, removeSalesPerson, toggleSalesStatus }}>
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