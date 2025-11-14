import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { SalesPerson, User } from '../types';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginSales: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  salesRoster: SalesPerson[];
  toggleSalesStatus: (salesId: string) => Promise<void>;
  registerAdmin: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  registerSales: (name: string, email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  updateSalesPerson: (id: string, updates: { name: string }) => Promise<{ success: boolean; message: string }>;
  deleteSalesPerson: (id: string) => Promise<{ success: boolean; message: string }>;
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
                    name: session.user.email?.split('@')[0] || 'Admin',
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

  const loginAdmin = useCallback(async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
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
  
  const registerAdmin = useCallback(async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Admin registration successful! Please check your email to confirm.' };
  }, []);

  const registerSales = useCallback(async (name: string, email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (signUpError) {
      return { success: false, message: signUpError.message };
    }
    if (!signUpData.user) {
        return { success: false, message: 'Registration failed: user not created.' };
    }

    const { error: profileError } = await supabase.from('sales_persons').insert([
      {
        id: signUpData.user.id,
        name,
        email,
        status: 'offline',
      },
    ]);

    if (profileError) {
      console.error('Failed to create sales profile:', profileError);
      // The error '[object Object]' suggests the error isn't being stringified correctly.
      // We will explicitly use the 'message' property to ensure a clean error string.
      const errorMessage = profileError.message || 'An unknown database error occurred';
      return { 
        success: false, 
        message: `User registered, but failed to create sales profile: ${errorMessage}. Please contact an admin.` 
      };
    }

    return { success: true, message: 'Sales registration successful! Please check your email to confirm.' };
  }, []);

  const updateSalesPerson = useCallback(async (id: string, updates: { name: string }): Promise<{ success: boolean; message: string }> => {
    const { error } = await supabase
      .from('sales_persons')
      .update({ name: updates.name })
      .eq('id', id);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Sales person updated successfully.' };
  }, []);

  const deleteSalesPerson = useCallback(async (id: string): Promise<{ success: boolean; message: string }> => {
    // This only deletes the sales profile. The user will still exist in Supabase Auth
    // and will be treated as an admin by the app. A proper implementation would require
    // a backend function to delete the auth.users record.
    const { error } = await supabase
      .from('sales_persons')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Sales person deleted. Note: The user account still exists and may need to be manually removed from Authentication settings.' };
  }, []);


  return (
    <AuthContext.Provider value={{ user, isLoading, loginSales, loginAdmin, logout, sendPasswordReset, salesRoster, toggleSalesStatus, registerAdmin, registerSales, updateSalesPerson, deleteSalesPerson }}>
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
