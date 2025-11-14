import React, { useState, useMemo } from 'react';
import { useLeads } from '../services/LeadContext';
import { Lead, Program, CallStatus } from '../types';
import { useAuth } from '../services/AuthContext';
import AddLeadModal from './AddLeadModal';
import LeadDetailModal from './LeadDetailModal';
import LeadCard from './LeadCard';
import { PlusIcon } from './Icons';

const SalesView: React.FC = () => {
    const { leads: allLeads } = useLeads();
    const { user, toggleSalesStatus } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [activeTab, setActiveTab] = useState('today');

    const salesPerson = user?.details;
    
    const myLeads = useMemo(() => {
        if (!user) return [];
        // If admin, show all leads. If sales, filter by assigned ID.
        const leadsToFilter = user.type === 'admin' 
            ? allLeads
            : allLeads.filter(lead => lead.assigned_sales_id === user.id);

        return leadsToFilter.filter(lead => 
            lead.call_status !== CallStatus.ClosedWon &&
            lead.call_status !== CallStatus.ClosedLost
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [allLeads, user]);

    const goalStats = useMemo(() => {
        if (!salesPerson) return null;
        const relevantLeads = allLeads.filter(l => l.assigned_sales_id === salesPerson.id);
        const closedWonLeads = relevantLeads.filter(l => l.call_status === CallStatus.ClosedWon);
        const totalSalesValue = closedWonLeads.reduce((sum, lead) => sum + lead.sale_value, 0);

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        return {
            newCustomers: relevantLeads.filter(l => l.created_at > thirtyDaysAgo).length,
            opportunities: relevantLeads.filter(l => [CallStatus.Contacted, CallStatus.Appointment, CallStatus.FollowUp, CallStatus.Negotiation, CallStatus.Quotation].includes(l.call_status)).length,
            revenue: totalSalesValue,
            conversionRate: relevantLeads.length > 0 ? (closedWonLeads.length / relevantLeads.length) * 100 : 0,
        };
    }, [allLeads, salesPerson]);

    const filteredLeads = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        switch (activeTab) {
            case 'today':
                return myLeads.filter(l => l.created_at.slice(0, 10) === today);
            case 'followup':
                return myLeads.filter(l => l.follow_up_date === today);
            case 'overdue':
                return myLeads.filter(l => l.follow_up_date && l.follow_up_date < today);
            default:
                return myLeads;
        }
    }, [myLeads, activeTab]);
    
    // Admins viewing this page won't have a salesPerson object
    if (user?.type === 'sales' && !salesPerson) {
        return <p>Loading sales user data...</p>;
    }

    const StatDisplay: React.FC<{title: string, value: string}> = ({title, value}) => (
        <div className="flex-1 text-center md:text-left px-4 py-2 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500 font-thai">{title}</div>
            <div className="text-xl font-bold text-gray-800">{value}</div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-thai">งานติดตาม</h2>
                    {salesPerson && (
                         <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-3 h-3 rounded-full ${salesPerson.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className="text-sm text-gray-500 capitalize">{salesPerson.status}</span>
                        </div>
                    )}
                </div>
                 {user?.type === 'sales' && salesPerson && (
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
                 )}
            </div>

            {goalStats && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row items-stretch space-y-2 md:space-y-0 md:space-x-4">
                    <StatDisplay title="ยอดขายเดือนนี้" value={`฿${goalStats.revenue.toLocaleString()}`} />
                    <StatDisplay title="ลูกค้าใหม่" value={goalStats.newCustomers.toString()} />
                    <StatDisplay title="โอกาส" value={goalStats.opportunities.toString()} />
                    <StatDisplay title="Conversion Rate" value={`${goalStats.conversionRate.toFixed(1)}%`} />
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-5 pt-4">
                     <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('today')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'today' ? 'border-primary text-primary-dark font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>งานติดตามวันนี้ ({myLeads.filter(l => l.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10)).length})</button>
                            <button onClick={() => setActiveTab('followup')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'followup' ? 'border-primary text-primary-dark font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>งานติดตาม Follow up ({myLeads.filter(l => l.follow_up_date === new Date().toISOString().slice(0, 10)).length})</button>
                            <button onClick={() => setActiveTab('overdue')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'overdue' ? 'border-primary text-primary-dark font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>งานติดตามเกินกำหนด ({myLeads.filter(l => l.follow_up_date && l.follow_up_date < new Date().toISOString().slice(0, 10)).length})</button>
                        </nav>
                    </div>
                </div>
                
                <div className="p-4">
                     {filteredLeads.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredLeads.map((lead) => (
                                <LeadCard key={lead.id} lead={lead} onSelect={setSelectedLead} />
                            ))}
                        </div>
                     ) : (
                        <div className="text-center py-16 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
                            <p className="mt-1 text-sm text-gray-500">There are no tasks in this category.</p>
                        </div>
                     )}
                </div>
            </div>

            {isAddModalOpen && salesPerson && (
                <AddLeadModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    salesPerson={salesPerson}
                />
            )}
            
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
