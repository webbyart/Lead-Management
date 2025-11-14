import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Lead, SalesPerson, Program, CallStatus, Appointment } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';

interface LeadContextType {
  leads: Lead[];
  appointments: Appointment[];
  addLead: (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'call_status' | 'sale_value' | 'notes' | 'follow_up_date' | 'assigned_sales_id'>) => Promise<{ success: boolean, message: string, assignedSales: string }>;
  updateLead: (leadId: string, updates: Partial<Lead>) => Promise<{ success: boolean, message: string }>;
  deleteLead: (leadId: string) => Promise<{ success: boolean, message: string }>;
  addAppointments: (customerName: string, baseDate: Date, assignedTo: string, leadId: string) => Promise<Appointment[]>;
  checkReminders: () => Lead[];
  reassignIdleLeads: () => Promise<{ message: string; reassignments: { leadId: string; oldSales: string; newSales: string }[] }>;
  checkFollowUpTasks: () => Lead[];
  getTodaysBirthdaysGlobally: () => Lead[];
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, salesRoster } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [lastAssignedIndex, setLastAssignedIndex] = useState(0);

  // Fetch initial data and set up real-time subscriptions
  useEffect(() => {
    if (!user) {
        setLeads([]);
        setAppointments([]);
        return;
    }

    const fetchLeads = async () => {
      // Admins should see all leads, sales only see their own.
      // RLS policy handles this automatically.
      const query = supabase.from('leads').select('*').order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) console.error("Lead fetch error: ", error.message)
      else if (data) setLeads(data);
    };
    const fetchAppointments = async () => {
      const { data, error } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: true });
      if (error) console.error("Appointment fetch error: ", error.message)
      else if (data) setAppointments(data);
    };

    fetchLeads();
    fetchAppointments();

    const leadsChannel = supabase.channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (_payload) => {
        fetchLeads();
      }).subscribe();

    const appointmentsChannel = supabase.channel('public:appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (_payload) => {
        fetchAppointments();
      }).subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(appointmentsChannel);
    };
  }, [user]);

  const addLead = useCallback(async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'call_status' | 'sale_value' | 'notes' | 'follow_up_date' | 'assigned_sales_id'>) => {
    // Check for duplicate phone number
    const { data: existingLead } = await supabase.from('leads').select('id').eq('phone', leadData.phone).maybeSingle();
    if (existingLead) {
      return { success: false, message: `เบอร์โทร ${leadData.phone} ซ้ำในระบบ`, assignedSales: '' };
    }

    let assignedSales: SalesPerson | null = null;
    
    // Manual assignment from Admin form by name
    if (leadData.assigned_sales_name) {
        assignedSales = salesRoster.find(s => s.name === leadData.assigned_sales_name) || null;
    } 
    // Automatic assignment logic
    else {
      if (leadData.program === Program.FixFaceLock) {
        const nutSales = salesRoster.find(s => s.name === 'นัท');
        if (nutSales?.status === 'online') {
          assignedSales = nutSales;
        } else {
          return { success: false, message: 'ไม่สามารถจ่ายงาน Fix Face Lock ได้, "นัท" ไม่ได้ออนไลน์', assignedSales: '' };
        }
      } else {
        const onlineSales = salesRoster.filter(s => s.status === 'online' && s.name !== 'นัท');
        if (onlineSales.length === 0) {
          return { success: false, message: 'ไม่มีเซลล์ออนไลน์สำหรับจ่ายงาน', assignedSales: '' };
        }
        const nextIndex = lastAssignedIndex % onlineSales.length;
        assignedSales = onlineSales[nextIndex];
        setLastAssignedIndex(prev => prev + 1);
      }
    }

    if (!assignedSales) {
        return { success: false, message: 'ไม่สามารถหาเซลล์เพื่อจ่ายงานได้', assignedSales: '' };
    }
    
    const newLead = {
      ...leadData,
      assigned_sales_id: assignedSales.id,
      assigned_sales_name: assignedSales.name,
      call_status: CallStatus.Uncalled,
      sale_value: 0,
      notes: '',
      follow_up_date: null,
    };

    const { error } = await supabase.from('leads').insert([newLead]);

    if (error) {
       return { success: false, message: `เกิดข้อผิดพลาด: ${error.message}`, assignedSales: '' };
    }

    return { success: true, message: `สร้าง Lead สำเร็จ! จ่ายงานให้ ${assignedSales.name}`, assignedSales: assignedSales.name };
  }, [salesRoster, lastAssignedIndex]);


  const updateLead = useCallback(async (leadId: string, updates: Partial<Lead>) => {
    const { error } = await supabase.from('leads').update({...updates, updated_at: new Date().toISOString()}).eq('id', leadId);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'อัปเดตข้อมูล Lead สำเร็จ' };
  }, []);
  
  const deleteLead = useCallback(async (leadId: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', leadId);
    if (error) {
        return { success: false, message: error.message };
    }
    return { success: true, message: 'ลบ Lead สำเร็จ' };
  }, []);
  
  const addAppointments = useCallback(async (customerName: string, serviceDate: Date, assignedTo: string, leadId: string) => {
    const followUpConfigs = [
        { value: 1, unit: 'day', label: '+1 วัน' },
        { value: 1, unit: 'month', label: '+1 เดือน' },
        { value: 3, unit: 'month', label: '+3 เดือน' },
        { value: 6, unit: 'month', label: '+6 เดือน' },
        { value: 1, unit: 'year', label: '+1 ปี' },
    ];

    const newAppointments: Omit<Appointment, 'id'|'created_at'>[] = followUpConfigs.map(config => {
        const date = new Date(serviceDate);
        if (config.unit === 'day') date.setDate(date.getDate() + config.value);
        if (config.unit === 'month') date.setMonth(date.getMonth() + config.value);
        if (config.unit === 'year') date.setFullYear(date.getFullYear() + config.value);
        return {
            customer_name: customerName,
            appointment_date: date.toISOString(),
            follow_up_type: config.label,
            assigned_to: assignedTo,
            lead_id: leadId
        };
    });

    const { data, error } = await supabase.from('appointments').insert(newAppointments).select();
    if (error) {
        console.error("Failed to add appointments", error);
        return [];
    }
    return data || [];
  }, []);

  const checkReminders = useCallback(() => {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    return leads.filter(lead => 
        lead.call_status === CallStatus.Uncalled && 
        new Date(lead.created_at).getTime() < tenMinutesAgo
    );
  }, [leads]);

  const reassignIdleLeads = useCallback(async () => {
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      const idleLeads = leads.filter(lead => 
          lead.call_status === CallStatus.Uncalled && 
          new Date(lead.created_at).getTime() < twentyFourHoursAgo
      );
      
      if (idleLeads.length === 0) {
          return { message: "No idle leads to reassign.", reassignments: [] };
      }

      const onlineSales = salesRoster.filter(s => s.status === 'online');
      if (onlineSales.length <= 1) {
          return { message: "Not enough online sales to reassign leads.", reassignments: [] };
      }

      const reassignments: {leadId: string, oldSales: string, newSales: string}[] = [];
      // FIX: Use .map with an async callback to correctly create an array of promises for Promise.all, resolving the type error.
      const updatePromises = idleLeads.map(async (lead) => {
          const currentSalesIndex = onlineSales.findIndex(s => s.id === lead.assigned_sales_id);
          const oldSalesName = lead.assigned_sales_name;
          
          if (currentSalesIndex !== -1) {
              const nextSalesIndex = (currentSalesIndex + 1) % onlineSales.length;
              const newSales = onlineSales[nextSalesIndex];
              
              reassignments.push({
                  leadId: lead.id,
                  oldSales: oldSalesName,
                  newSales: newSales.name
              });

              await supabase.from('leads').update({
                assigned_sales_id: newSales.id,
                assigned_sales_name: newSales.name
              }).eq('id', lead.id);
          }
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }
      
      return {
          message: `Reassigned ${reassignments.length} idle leads.`,
          reassignments
      };
  }, [leads, salesRoster]);

  const checkFollowUpTasks = useCallback(() => {
      const today = new Date().toISOString().slice(0, 10);
      return leads.filter(lead => lead.follow_up_date === today);
  }, [leads]);

  const getTodaysBirthdaysGlobally = useCallback(() => {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayMMDD = `${month}-${day}`;
      
      return leads.filter(lead => lead.birth_date && lead.birth_date.slice(5) === todayMMDD);
  }, [leads]);


  const contextValue = {
      leads,
      appointments,
      addLead,
      updateLead,
      deleteLead,
      addAppointments,
      checkReminders,
      reassignIdleLeads,
      checkFollowUpTasks,
      getTodaysBirthdaysGlobally
  };

  return (
    <LeadContext.Provider value={contextValue}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};
