import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { SalesPerson, User } from '../types';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginSales: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  loginAdmin: (pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  salesRoster: SalesPerson[];
  toggleSalesStatus: (salesId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [salesRoster, setSalesRoster] = useState<SalesPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSalesProfile = async (userId: string): Promise<SalesPerson | null> => {
      const { data, error } = await supabase
        .from('sales_persons')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
          // This is expected if the user is an admin and has no sales profile
          if (error.code !== 'PGRST116') {
             console.error('Error fetching sales profile:', error);
          }
          return null;
      }
      return data;
  };

  useEffect(() => {
    const handleSession = async (session: Session | null) => {
        if (session?.user) {
            const profile = await fetchSalesProfile(session.user.id);
            if (profile) { // It's a sales person
                 setUser({
                    id: session.user.id,
                    type: 'sales',
                    name: profile.name,
                    email: profile.email,
                    details: profile,
                });
            } else { // Assume it's an admin if no sales profile exists
                 setUser({
                    id: session.user.id,
                    type: 'admin',
                    name: 'Admin',
                    email: session.user.email ?? 'admin@admin.com',
                });
            }
        } else {
            setUser(null);
        }
        setIsLoading(false);
    }
    
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        handleSession(session);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoading(true);
        handleSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Fetch and subscribe to sales roster changes
  useEffect(() => {
    const fetchRoster = async () => {
        const { data, error } = await supabase.from('sales_persons').select('*').order('created_at');
        if (data) setSalesRoster(data);
        if (error) console.error("Error fetching sales roster:", error);
    };
    fetchRoster();

    const channel = supabase
        .channel('public:sales_persons')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_persons' }, _payload => {
            fetchRoster(); // Refetch all on change
        })
        .subscribe();
    
    return () => {
        supabase.removeChannel(channel);
    }
  }, []);


  const loginSales = useCallback(async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if(error) return { success: false, message: error.message };
    return { success: true, message: 'Login successful!' };
  }, []);

  const loginAdmin = useCallback(async (pass: string): Promise<{ success: boolean; message: string }> => {
    // In a real app, admin would have a role. Here we sign in a specific user.
    const adminEmail = 'admin@admin.com';
    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: pass });
    if(error) return { success: false, message: 'Invalid admin credentials' };
    return { success: true, message: 'Admin login successful!' };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);
  
  const sendPasswordReset = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, // Optional: redirect back to app
    });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Password reset link sent. Please check your email.' };
  }, []);

  const toggleSalesStatus = useCallback(async (salesId: string) => {
    const currentSales = salesRoster.find(s => s.id === salesId);
    if (!currentSales) return;

    const newStatus = currentSales.status === 'online' ? 'offline' : 'online';
    
    // Optimistic update on the frontend to feel faster
    setSalesRoster(prev => prev.map(s => s.id === salesId ? {...s, status: newStatus} : s));
    if (user && user.details && user.details.id === salesId) {
       setUser(prevUser => prevUser ? { ...prevUser, details: {...prevUser.details!, status: newStatus} } : null);
    }

    const { error } = await supabase
        .from('sales_persons')
        .update({ status: newStatus })
        .eq('id', salesId);

    if (error) {
        console.error("Failed to update status", error);
        // Revert UI on failure
        setSalesRoster(salesRoster);
        if (user && user.details && user.details.id === salesId) {
          setUser(prevUser => prevUser ? { ...prevUser, details: {...prevUser.details!, status: currentSales.status} } : null);
        }
    }
  }, [salesRoster, user]);


  return (
    <AuthContext.Provider value={{ user, isLoading, loginSales, loginAdmin, logout, sendPasswordReset, salesRoster, toggleSalesStatus }}>
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
