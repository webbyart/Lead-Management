import React, { useState, useMemo } from 'react';
import { UserRole, User, SalesPerson, Lead } from './types';
import AdminView from './components/AdminView';
import SalesView from './components/SalesView';
import AfterCareView from './components/AfterCareView';
import SystemView from './components/SystemView';
import CalendarView from './components/CalendarView';
import LoginView from './components/LoginView';
import AdminLoginView from './components/AdminLoginView';
import CustomerRegistrationForm from './components/CustomerRegistrationForm';
import { LeadProvider, useLeads } from './services/LeadContext';
import { AuthProvider, useAuth } from './services/AuthContext';
import SuperAdminLoginView from './components/SuperAdminLoginView';
import SuperAdminView from './components/SuperAdminView';
import { 
    ChartBarIcon, PresentationChartLineIcon, UsersIcon, CogIcon, CalendarIcon, LifebuoyIcon 
} from './components/Icons';


type MenuId = 'dashboard' | 'tasks' | 'customers' | 'calendar' | 'aftercare' | 'reports' | 'settings';

interface MenuItem {
    id: MenuId;
    label: string;
    icon: React.FC<{className?: string}>;
    allowed: ('admin' | 'sales')[];
}

const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'แผนบริหาร', icon: PresentationChartLineIcon, allowed: ['admin'] },
    { id: 'tasks', label: 'งานติดตาม', icon: ChartBarIcon, allowed: ['admin', 'sales'] },
    { id: 'calendar', label: 'ปฏิทิน', icon: CalendarIcon, allowed: ['admin', 'sales'] },
    { id: 'aftercare', label: 'After-Care', icon: LifebuoyIcon, allowed: ['admin'] },
    { id: 'customers', label: 'ลูกค้า', icon: UsersIcon, allowed: ['admin', 'sales'] },
    { id: 'settings', label: 'ตั้งค่า', icon: CogIcon, allowed: ['admin'] },
];

const CustomerManagementView: React.FC = () => {
    const { leads, updateLead } = useLeads();
    const { salesRoster } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead =>
            `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm)
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [leads, searchTerm]);

    const handleOpenReassign = (lead: Lead) => {
        setSelectedLead(lead);
        setIsReassignModalOpen(true);
    };

    const handleReassign = async (newSalesId: string) => {
        if (!selectedLead || !newSalesId) return;
        
        const newSales = salesRoster.find(s => s.id === newSalesId);
        if (!newSales) return;

        await updateLead(selectedLead.id, {
            assigned_sales_id: newSales.id,
            assigned_sales_name: newSales.name,
        });
        
        setIsReassignModalOpen(false);
        setSelectedLead(null);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 font-thai">จัดการลูกค้า</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark"
                />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Customer Name</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Assigned To</th>
                                <th className="px-4 py-3">Received Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map(lead => (
                                <tr key={lead.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{lead.first_name} {lead.last_name}</td>
                                    <td className="px-4 py-3">{lead.phone}</td>
                                    <td className="px-4 py-3">{lead.call_status}</td>
                                    <td className="px-4 py-3">{lead.assigned_sales_name}</td>
                                    <td className="px-4 py-3">{new Date(lead.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleOpenReassign(lead)} className="font-medium text-primary-dark hover:underline">Re-assign</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             {isReassignModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-4">Re-assign Lead for {selectedLead.first_name}</h3>
                        <select
                            onChange={(e) => handleReassign(e.target.value)}
                            defaultValue=""
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                            <option value="" disabled>Select a Salesperson</option>
                            {salesRoster.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                            ))}
                        </select>
                        <button onClick={() => setIsReassignModalOpen(false)} className="mt-4 w-full py-2 bg-gray-200 rounded-lg">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};


const AppShell: React.FC = () => {
    const { user, logout } = useAuth();
    const { leads } = useLeads();
    const defaultView: MenuId = user?.type === 'admin' ? 'dashboard' : 'tasks';
    const [activeMenu, setActiveMenu] = useState<MenuId>(defaultView);

    const availableMenuItems = useMemo(() => {
        if (!user) return [];
        return menuItems.filter(item => item.allowed.includes(user.type));
    }, [user]);
    
    const newLeadsCount = useMemo(() => {
       if (user?.type !== 'sales') return 0;
       return leads.filter(l => l.assigned_sales_id === user.id && l.call_status === 'ยังไม่ได้โทร').length;
    }, [leads, user]);


    const Header: React.FC = () => (
        <header className="bg-primary sticky top-0 z-30 shadow-md">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-secondary font-thai">SYSTEM</h1>
                        </div>
                        <span className="text-secondary font-semibold ml-4 pl-4 border-l border-amber-600/50">บริการงานขาย</span>
                    </div>
                    <div className="flex items-center">
                        <div className="relative">
                           <button className="p-2 text-secondary rounded-full hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white">
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V4a2 2 0 10-4 0v1.341A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                {newLeadsCount > 0 && (
                                     <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold">
                                        {newLeadsCount}
                                     </span>
                                )}
                            </button>
                        </div>
                        <div className="relative ml-3">
                            <div>
                                <button onClick={logout} className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                    <span className="sr-only">Open user menu</span>
                                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold">
                                        {user?.name.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="ml-4 text-right">
                           <p className="text-sm font-semibold text-secondary">{user?.name}</p>
                           <p className="text-xs text-secondary/80">บริษัท ยูบิลลี่ จำกัด</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );

    const Sidebar: React.FC = () => (
        <aside className="w-64 bg-secondary flex flex-col fixed inset-y-0 z-20">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-16 flex-1 px-2 space-y-1">
                    {availableMenuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveMenu(item.id)}
                            className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150 ${
                                activeMenu === item.id 
                                ? 'bg-primary text-secondary' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <item.icon className={`mr-3 flex-shrink-0 h-6 w-6 ${
                                activeMenu === item.id ? 'text-secondary' : 'text-gray-400 group-hover:text-gray-300'
                            }`} />
                            <span className="font-thai">{item.label}</span>
                             {activeMenu === item.id && <div className="absolute left-0 w-1 h-full bg-primary rounded-r-md"></div>}
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );

    const CurrentView = useMemo(() => {
        if(user?.type === 'sales' && activeMenu !== 'tasks' && activeMenu !== 'customers' && activeMenu !== 'calendar') {
             return <SalesView />;
        }

        switch (activeMenu) {
            case 'dashboard': return <AdminView />;
            case 'tasks': return <SalesView />; // Admin can view all tasks, Sales sees their own.
            case 'aftercare': return <AfterCareView />;
            case 'calendar': return <CalendarView />;
            case 'settings': return <SystemView />;
            case 'customers': return <CustomerManagementView />;
            case 'reports': return <div>Reports View Placeholder</div>;
            default: return user?.type === 'admin' ? <AdminView /> : <SalesView />;
        }
    }, [activeMenu, user]);

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            <Sidebar />
            <div className="flex flex-col w-0 flex-1 overflow-hidden ml-64">
                <Header />
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6 px-4 sm:px-6 lg:px-8">
                        {CurrentView}
                    </div>
                </main>
            </div>
        </div>
    );
};


const PublicShell: React.FC<{ onLoginRequest: (type: 'adminLogin' | 'salesLogin' | 'superAdminLogin') => void }> = ({ onLoginRequest }) => {
    const [activeTab, setActiveTab] = useState<'registration' | 'events'>('registration');

     return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <h1 className="text-3xl font-bold text-secondary font-thai">
                       SYSTEM <span className="text-primary">Lead Management</span>
                    </h1>
                     <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                         <button onClick={() => onLoginRequest('adminLogin')} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium">
                            Admin Login
                        </button>
                        <button onClick={() => onLoginRequest('salesLogin')} className="px-4 py-2 bg-primary hover:bg-primary-dark text-secondary rounded-lg transition-colors text-sm font-medium">
                            Sales Login
                        </button>
                        <button onClick={() => onLoginRequest('superAdminLogin')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium">
                            Super Admin
                        </button>
                    </div>
                </div>
              </div>
            </header>
             <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <div className="mb-8">
                        <div className="flex justify-center border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('registration')}
                                    className={`${
                                        activeTab === 'registration'
                                        ? 'border-primary text-primary-dark'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors font-thai`}
                                >
                                    ลงทะเบียนรับบริการ
                                </button>
                                <button
                                    onClick={() => setActiveTab('events')}
                                    className={`${
                                        activeTab === 'events'
                                        ? 'border-primary text-primary-dark'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors font-thai`}
                                >
                                    Upcoming Events
                                </button>
                            </nav>
                        </div>
                    </div>
                    
                    <div>
                        {activeTab === 'registration' && <CustomerRegistrationForm />}
                        {activeTab === 'events' && (
                            <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 font-thai">Upcoming Events</h2>
                                <CalendarView />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [view, setView] = useState<'public' | 'adminLogin' | 'salesLogin' | 'superAdminLogin'>('public');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700">Loading Application...</h2>
            </div>
        </div>
    );
  }

  if (isSuperAdmin) {
    return <SuperAdminView onLogout={() => setIsSuperAdmin(false)} />;
  }

  if (user) {
    return <AppShell />;
  }
  
  // No user logged in
  switch (view) {
      case 'adminLogin':
          return <AdminLoginView onBack={() => setView('public')} />;
      case 'salesLogin':
          return <LoginView onBack={() => setView('public')} />;
      case 'superAdminLogin':
          return <SuperAdminLoginView onBack={() => setView('public')} onSuccess={() => setIsSuperAdmin(true)} />;
      case 'public':
      default:
          return <PublicShell onLoginRequest={(type) => setView(type)} />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LeadProvider>
        <AppContent />
      </LeadProvider>
    </AuthProvider>
  );
}

export default App;
