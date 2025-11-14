import React, { useState, useMemo } from 'react';
import { useLeads } from '../services/LeadContext';
// FIX: Imported the `Program` enum to resolve reference errors.
import { Lead, Program } from '../types';
import { useAuth } from '../services/AuthContext';
import AddLeadModal from './AddLeadModal';
import LeadDetailModal from './LeadDetailModal';
import { PlusIcon } from './Icons';

const TaskListItem: React.FC<{ lead: Lead, onSelect: (lead: Lead) => void }> = ({ lead, onSelect }) => {
    
    const getUrgency = () => {
        if (lead.program === Program.FixFaceLock) return 5;
        if (lead.program === Program.Premium) return 4;
        return 2;
    };
    
    const urgency = getUrgency();

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    return (
        <tr onClick={() => onSelect(lead)} className="bg-white hover:bg-gray-50 cursor-pointer border-b border-gray-200">
            <td className="px-5 py-4 text-sm">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-dark focus:ring-primary" />
            </td>
            <td className="px-5 py-4 text-sm text-gray-800 font-medium">
                ติดต่อ (โทร)
            </td>
            <td className="px-5 py-4 text-sm text-gray-800">
                <div className="font-semibold">{lead.firstName} {lead.lastName}</div>
                <div className="text-gray-500">{lead.phone}</div>
            </td>
            <td className="px-5 py-4 text-sm">
                 <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < urgency ? 'text-red-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M19.16,8.45c-0.3-0.88-1.33-1.29-2.18-0.99C15.9,7.84,15.25,8.8,15,9.85c-0.29,1.21-0.12,2.4,0.12,3.6c-0.2,0.47-0.5,0.92-0.87,1.33c-1.3,1.43-3.15,2.42-5.18,2.73c-0.03,0-0.06,0-0.09,0c-1.3,0-2.58-0.34-3.76-0.96c-1.1-0.57-2.11-1.37-2.95-2.39c-0.49-0.59-0.92-1.24-1.25-1.94c-0.33-0.68-0.56-1.4-0.69-2.14c-0.13-0.78-0.16-1.57-0.09-2.37c0.07-0.8,0.25-1.58,0.53-2.34c0.1-0.27,0.22-0.54,0.36-0.8c-0.91-0.21-1.85,0.39-2.12,1.32c-0.27,0.93,0.1,1.94,0.76,2.65c0.63,0.68,1.44,1.19,2.34,1.49c0.88,0.3,1.82,0.41,2.75,0.32c1-0.1,1.96-0.4,2.83-0.89c1.02-0.57,1.92-1.37,2.65-2.34c0.7-0.93,1.2-2.06,1.43-3.26c0.07-0.38,0.11-0.75,0.15-1.12c0.01-0.09,0.01-0.18,0.02-0.27c0.26-0.91,1.25-1.4,2.15-1.18C18.89,7.31,19.43,8.13,19.16,8.45z" />
                        </svg>
                    ))}
                </div>
            </td>
             <td className="px-5 py-4 text-sm">
                {isToday(lead.createdAt) && (
                    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
                        Today
                    </span>
                )}
            </td>
        </tr>
    );
};


const SalesView: React.FC = () => {
    const { getLeadsBySalesId, leads: allLeads, getDashboardStats } = useLeads();
    const { user, toggleSalesStatus } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [activeTab, setActiveTab] = useState('today');

    const salesPerson = user?.details;
    
    const { goalStats } = useMemo(() => {
        if (!salesPerson) return { goalStats: null };
        return getDashboardStats(salesPerson.name);
    }, [salesPerson, getDashboardStats, allLeads]);
    
    const leads = useMemo(() => {
        if (salesPerson) {
            return getLeadsBySalesId(salesPerson.id);
        }
        return [];
    }, [salesPerson, getLeadsBySalesId, allLeads]);

    const filteredLeads = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        switch (activeTab) {
            case 'today':
                return leads.filter(l => new Date(l.createdAt).toISOString().slice(0, 10) === today);
            case 'followup':
                return leads.filter(l => l.followUpDate === today);
            case 'overdue':
                return leads.filter(l => l.followUpDate && l.followUpDate < today);
            default:
                return leads;
        }
    }, [leads, activeTab]);

    if (!salesPerson || !goalStats) {
        return <p>Loading user...</p>;
    }
    
    const GoalProgressBar: React.FC<{title: string, value: number, goal: number, color: string}> = ({title, value, goal, color}) => {
        const percentage = Math.min((value/goal) * 100, 100).toFixed(2);
        return (
             <div className="flex-1">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 font-thai">{title}</span>
                    <span className="text-sm font-semibold">{value}/{goal}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className={`${color} h-1.5 rounded-full`} style={{width: `${percentage}%`}}></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-thai">งานติดตาม</h2>
                    <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-3 h-3 rounded-full ${salesPerson.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-500 capitalize">{salesPerson.status}</span>
                    </div>
                </div>
                <div className="flex space-x-2 mt-3 sm:mt-0">
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-white hover:bg-gray-900 transition-colors flex items-center"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        กิจกรรม
                    </button>
                    <button 
                        onClick={() => toggleSalesStatus(salesPerson.id)}
                        className={`w-28 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${salesPerson.status === 'online' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    >
                        Go {salesPerson.status === 'online' ? 'Offline' : 'Online'}
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <GoalProgressBar title="ลูกค้าใหม่" value={goalStats.newCustomers} goal={10} color="bg-green-500" />
                <GoalProgressBar title="โอกาส" value={goalStats.opportunities} goal={10} color="bg-blue-500" />
                <GoalProgressBar title="ยอดขาย" value={goalStats.revenue/1000} goal={490} color="bg-yellow-500" />
                <GoalProgressBar title="กำไร" value={goalStats.profit/1000} goal={490} color="bg-purple-500" />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-5 pt-4">
                     <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('today')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'today' ? 'border-primary text-primary-dark font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>งานติดตามวันนี้ ({leads.filter(l => new Date(l.createdAt).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)).length})</button>
                            <button onClick={() => setActiveTab('followup')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'followup' ? 'border-primary text-primary-dark font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>งานติดตาม Follow up ({leads.filter(l => l.followUpDate === new Date().toISOString().slice(0, 10)).length})</button>
                            <button onClick={() => setActiveTab('overdue')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'overdue' ? 'border-primary text-primary-dark font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>งานติดตามเกินกำหนด ({leads.filter(l => l.followUpDate && l.followUpDate < new Date().toISOString().slice(0, 10)).length})</button>
                        </nav>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" /></th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">กิจกรรม</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ความเร่งด่วน</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => (
                                    <TaskListItem key={lead.id} lead={lead} onSelect={setSelectedLead} />
                                ))
                           ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
                                        <p className="mt-1 text-sm text-gray-500">There are no tasks in this category.</p>
                                    </td>
                                </tr>
                           )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddLeadModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                salesPerson={salesPerson}
            />
            
            {selectedLead && (
                <LeadDetailModal
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                />
            )}
        </div>
    );
};

export default SalesView;
