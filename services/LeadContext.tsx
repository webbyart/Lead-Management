import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Lead, SalesPerson, Program, CallStatus, Appointment } from '../types';
import { leads as mockLeads } from './mockData';
import { useAuth } from './AuthContext';

interface DashboardStats {
    totalLeads: number;
    totalSalesValue: number;
    conversionRate: string;
    uncalledLeads: number;
    awaitingPayment: number;
    forecast: number;
    rank?: number | 'N/A';
    totalSalespeople?: number;
}

interface SalesPerformance {
    name: string;
    leadsCount: number;
    salesValue: number;
    conversionRate: number;
    statusCounts: { [key: string]: number };
}

interface GoalStats {
    newCustomers: number;
    opportunities: number;
    revenue: number;
    profit: number;
}

interface LeadContextType {
  leads: Lead[];
  salesRoster: SalesPerson[];
  appointments: Appointment[];
  addLead: (leadData: Omit<Lead, 'id' | 'callStatus' | 'saleValue' | 'notes' | 'followUpDate' | 'createdAt'>, isFromAdmin?: boolean) => { success: boolean, message: string, assignedSales: string };
  updateLead: (leadId: string, updates: Partial<Lead>) => { success: boolean, message: string };
  deleteLead: (leadId: string) => { success: boolean, message: string };
  getLeadsBySalesId: (salesId: string) => Lead[];
  checkReminders: () => Lead[];
  reassignIdleLeads: () => { reassignments: { leadId: string, oldSales: string, newSales: string }[], message: string };
  checkFollowUpTasks: () => Lead[];
  addAppointments: (customerName: string, baseDate: Date, assignedTo: string) => Appointment[];
  getBirthdayStats: (salesName: string) => { today: Lead[], thisMonth: Lead[] };
  getTodaysBirthdaysGlobally: () => Lead[];
  getThisMonthsBirthdaysGlobally: () => Lead[];
  getDashboardStats: (salesName?: string) => { stats: DashboardStats, performance: SalesPerformance[], statusDistribution: {name: string, value: number}[], goalStats: GoalStats };
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { salesRoster } = useAuth();
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [lastAssignedIndex, setLastAssignedIndex] = useState(0);

  const addLead = useCallback((leadData: Omit<Lead, 'id' | 'callStatus' | 'saleValue' | 'notes' | 'followUpDate' | 'createdAt'>, isFromAdmin: boolean = true) => {
    // Check for duplicate phone number
    if (leads.some(lead => lead.phone === leadData.phone)) {
      return { success: false, message: `เบอร์โทร ${leadData.phone} ซ้ำในระบบ`, assignedSales: '' };
    }

    let assignedSalesName = '';

    if (isFromAdmin && leadData.assignedSales) {
      // Manual assignment from Admin form
      assignedSalesName = leadData.assignedSales;
    } else if (isFromAdmin) {
       // Admin automatic assignment logic
      if (leadData.program === Program.FixFaceLock) {
        const nutSales = salesRoster.find(s => s.name === 'นัท');
        if (nutSales && nutSales.status === 'online') {
          assignedSalesName = nutSales.name;
        } else {
           return { success: false, message: 'ไม่สามารถจ่ายงาน Fix Face Lock ได้, "นัท" ไม่ได้ออนไลน์', assignedSales: '' };
        }
      } else {
        // Round-robin assignment logic for other programs
        const onlineSales = salesRoster.filter(s => s.status === 'online' && s.name !== 'นัท');
        if (onlineSales.length === 0) {
          return { success: false, message: 'ไม่มีเซลล์ออนไลน์สำหรับจ่ายงาน', assignedSales: '' };
        }
        const nextIndex = lastAssignedIndex % onlineSales.length;
        assignedSalesName = onlineSales[nextIndex].name;
        setLastAssignedIndex(prev => prev + 1);
      }
    } else {
        // If added by sales, assign directly to them
        assignedSalesName = leadData.assignedSales;
    }
    
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      assignedSales: assignedSalesName,
      callStatus: CallStatus.Uncalled,
      saleValue: 0,
      notes: '',
      followUpDate: null,
      createdAt: new Date(),
    };

    setLeads(prevLeads => [newLead, ...prevLeads]);
    return { success: true, message: `สร้าง Lead สำเร็จ! จ่ายงานให้ ${assignedSalesName}`, assignedSales: assignedSalesName };
  }, [leads, salesRoster, lastAssignedIndex]);

  const updateLead = useCallback((leadId: string, updates: Partial<Lead>) => {
    let success = false;
    setLeads(prevLeads =>
      prevLeads.map(lead => {
        if (lead.id === leadId) {
          success = true;
          return { ...lead, ...updates };
        }
        return lead;
      })
    );
    return { success, message: success ? 'อัปเดตข้อมูล Lead สำเร็จ' : 'ไม่พบ Lead ที่ต้องการอัปเดต' };
  }, []);
  
  const deleteLead = useCallback((leadId: string) => {
    const leadExists = leads.some(lead => lead.id === leadId);
    if (!leadExists) {
        return { success: false, message: 'ไม่พบ Lead ที่ต้องการลบ' };
    }
    setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
    return { success: true, message: 'ลบ Lead สำเร็จ' };
  }, [leads]);


  const getLeadsBySalesId = useCallback((salesId: string): Lead[] => {
    const salesPerson = salesRoster.find(s => s.id === salesId);
    if (!salesPerson) return [];
    
    return leads.filter(lead => 
      lead.assignedSales === salesPerson.name &&
      lead.callStatus !== CallStatus.ClosedWon &&
      lead.callStatus !== CallStatus.ClosedLost
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [leads, salesRoster]);

  const checkReminders = useCallback(() => {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    return leads.filter(lead => 
        lead.callStatus === CallStatus.Uncalled && 
        lead.createdAt.getTime() < tenMinutesAgo
    );
  }, [leads]);

  const reassignIdleLeads = useCallback(() => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const reassignments: { leadId: string, oldSales: string, newSales: string }[] = [];
    let message = '';

    const onlineSales = salesRoster.filter(s => s.status === 'online' && s.name !== 'นัท');
    if(onlineSales.length <= 1) {
        return { reassignments, message: "ไม่สามารถเด้งงานได้ มีเซลล์ออนไลน์ไม่เพียงพอ" };
    }
    
    let currentNewSalesIndex = 0;

    setLeads(currentLeads => {
        const newLeads = [...currentLeads];
        // FIX: Corrected the argument order in forEach from (index, lead) to (lead, index)
        newLeads.forEach((lead, index) => {
            if (lead.callStatus === CallStatus.Uncalled && 
                lead.createdAt.getTime() < twentyFourHoursAgo &&
                lead.program !== Program.FixFaceLock) {
                
                const oldSalesName = lead.assignedSales;
                let availableNewSales = onlineSales.filter(s => s.name !== oldSalesName);

                if(availableNewSales.length > 0) {
                    const newSales = availableNewSales[currentNewSalesIndex % availableNewSales.length];
                    newLeads[index].assignedSales = newSales.name;
                    reassignments.push({ leadId: lead.id, oldSales: oldSalesName, newSales: newSales.name });
                    currentNewSalesIndex++;
                }
            }
        });
        return newLeads;
    });

    message = reassignments.length > 0 ? `เด้งงานที่ค้างเกิน 24 ชม. จำนวน ${reassignments.length} รายการ` : 'ไม่พบ Lead ค้างเกิน 24 ชม. ที่ต้องเด้งงาน';
    return { reassignments, message };
  }, [leads, salesRoster]);

  const checkFollowUpTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return leads.filter(lead => 
      lead.followUpDate === today &&
      lead.callStatus !== CallStatus.ClosedWon &&
      lead.callStatus !== CallStatus.ClosedLost
    );
  }, [leads]);
  
  const addAppointments = useCallback((customerName: string, serviceDate: Date, assignedTo: string) => {
    const followUpConfigs = [
        { value: 1, unit: 'day', label: '+1 วัน' },
        { value: 1, unit: 'month', label: '+1 เดือน' },
        { value: 3, unit: 'month', label: '+3 เดือน' },
        { value: 6, unit: 'month', label: '+6 เดือน' },
        { value: 1, unit: 'year', label: '+1 ปี' },
    ];

    const newAppointments: Appointment[] = followUpConfigs.map(config => {
        const date = new Date(serviceDate);
        if (config.unit === 'day') date.setDate(date.getDate() + config.value);
        if (config.unit === 'month') date.setMonth(date.getMonth() + config.value);
        if (config.unit === 'year') date.setFullYear(date.getFullYear() + config.value);
        return {
            id: `appt_${customerName}_${Date.now()}_${config.label}`,
            customerName,
            appointmentDate: date,
            followUpType: config.label,
            assignedTo,
        };
    });

    setAppointments(prev => [...prev, ...newAppointments].sort((a,b) => a.appointmentDate.getTime() - b.appointmentDate.getTime()));
    return newAppointments;
  }, []);

  const getBirthdayStats = useCallback((salesName: string) => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();
    
    const relevantLeads = leads.filter(lead => lead.assignedSales === salesName);

    const thisMonth = relevantLeads.filter(lead => {
        if (!lead.birthDate) return false;
        const [_, month] = lead.birthDate.split('-').map(Number);
        return month === currentMonth;
    });
    
    const todaysBirthdays = thisMonth.filter(lead => {
         if (!lead.birthDate) return false;
         const [_, __, day] = lead.birthDate.split('-').map(Number);
         return day === currentDate;
    });

    return { today: todaysBirthdays, thisMonth };
  }, [leads]);

  const getTodaysBirthdaysGlobally = useCallback(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();

    return leads.filter(lead => {
      if (!lead.birthDate) return false;
      const [_, month, day] = lead.birthDate.split('-').map(Number);
      return month === currentMonth && day === currentDate;
    });
  }, [leads]);

  const getThisMonthsBirthdaysGlobally = useCallback(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    return leads.filter(lead => {
      if (!lead.birthDate) return false;
      const [_, month] = lead.birthDate.split('-').map(Number);
      return month === currentMonth;
    });
  }, [leads]);

  const getDashboardStats = useCallback((salesName?: string) => {
    const relevantLeads = salesName ? leads.filter(l => l.assignedSales === salesName) : leads;

    const totalLeads = relevantLeads.length;
    const closedWonLeads = relevantLeads.filter(l => l.callStatus === CallStatus.ClosedWon);
    const totalSalesValue = closedWonLeads.reduce((sum, lead) => sum + lead.saleValue, 0);
    const conversionRate = totalLeads > 0 ? (closedWonLeads.length / totalLeads) * 100 : 0;
    const uncalledLeadsCount = relevantLeads.filter(l => l.callStatus === CallStatus.Uncalled).length;

    const stats: DashboardStats = {
        totalLeads,
        totalSalesValue,
        conversionRate: `${conversionRate.toFixed(1)}%`,
        uncalledLeads: uncalledLeadsCount,
        awaitingPayment: 683745.34, // Mock data
        forecast: 934000.00, // Mock data
    };
    
    const statusDistributionRaw = relevantLeads.reduce((acc, lead) => {
        const status = lead.callStatus;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as {[key: string]: number});

    const statusDistribution = [
        {name: 'โอกาสใหม่', value: statusDistributionRaw[CallStatus.Contacted] || 0},
        {name: 'เสนอราคา', value: statusDistributionRaw[CallStatus.Quotation] || 0},
        {name: 'ต่อรองราคา', value: statusDistributionRaw[CallStatus.Negotiation] || 0},
        {name: 'LOST', value: statusDistributionRaw[CallStatus.ClosedLost] || 0},
        {name: 'WIN', value: statusDistributionRaw[CallStatus.ClosedWon] || 0},
    ].filter(item => item.value > 0);
    
    const goalStats = {
        newCustomers: relevantLeads.filter(l => l.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
        opportunities: relevantLeads.filter(l => [CallStatus.Contacted, CallStatus.Appointment, CallStatus.FollowUp, CallStatus.Negotiation, CallStatus.Quotation].includes(l.callStatus)).length,
        revenue: totalSalesValue,
        profit: totalSalesValue * 0.6341, // Mock profit margin
    };


    const performance: SalesPerformance[] = salesRoster.map(sales => {
        const salesLeads = leads.filter(l => l.assignedSales === sales.name);
        const salesClosedWon = salesLeads.filter(l => l.callStatus === CallStatus.ClosedWon);
        const salesValue = salesClosedWon.reduce((sum, lead) => sum + lead.saleValue, 0);
        const statusCounts = salesLeads.reduce((acc, lead) => {
            const key = Object.keys(CallStatus).find(k => CallStatus[k as keyof typeof CallStatus] === lead.callStatus)?.toLowerCase() || 'unknown';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as {[key: string]: number});


        return {
            name: sales.name,
            leadsCount: salesLeads.length,
            salesValue,
            conversionRate: salesLeads.length > 0 ? (salesClosedWon.length / salesLeads.length) * 100 : 0,
            statusCounts: {
                contacted: statusCounts.contacted || 0,
                quotation: statusCounts.quotation || 0,
                negotiation: statusCounts.negotiation || 0,
                lost: statusCounts.closedlost || 0,
                won: statusCounts.closedwon || 0,
            }
        };
    }).sort((a,b) => b.salesValue - a.salesValue);
    
    if (salesName) {
        const rank = performance.findIndex(p => p.name === salesName) + 1;
        stats.rank = rank > 0 ? rank : 'N/A';
        stats.totalSalespeople = performance.length;
    }

    return { stats, performance, statusDistribution, goalStats };
  }, [leads, salesRoster]);


  return (
    <LeadContext.Provider value={{ leads, salesRoster, appointments, addLead, updateLead, deleteLead, getLeadsBySalesId, checkReminders, reassignIdleLeads, checkFollowUpTasks, addAppointments, getBirthdayStats, getTodaysBirthdaysGlobally, getThisMonthsBirthdaysGlobally, getDashboardStats }}>
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
