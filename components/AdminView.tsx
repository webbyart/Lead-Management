import React, { useState, useMemo } from 'react';
import { useLeads } from '../services/LeadContext';
import { useAuth } from '../services/AuthContext';
import { Program, SalesPerson, CallStatus, Lead } from '../types';
import { PlusIcon, DocumentArrowDownIcon, UsersIcon, PresentationChartLineIcon, CalendarIcon, ChartBarIcon } from './Icons';

const StatCard: React.FC<{ title: string; value: string | number; change?: number; icon: React.ReactNode; }> = ({ title, value, change, icon }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 font-thai">{title}</p>
            {icon}
        </div>
        <div className="mt-2">
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {change !== undefined && (
                <div className="flex items-center text-sm mt-1">
                    <span className={`flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.707l-3-3a1 1 0 011.414-1.414L9 10.586V7a1 1 0 112 0v3.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        )}
                        {Math.abs(change).toFixed(2)}%
                    </span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                </div>
            )}
        </div>
    </div>
);

const GoalProgress: React.FC<{title: string, value: number, goal: number, formatAsCurrency?: boolean}> = ({ title, value, goal, formatAsCurrency }) => {
    const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
    const displayValue = formatAsCurrency ? `฿${value.toLocaleString()}` : value.toLocaleString();
    const displayGoal = formatAsCurrency ? `฿${goal.toLocaleString()}` : goal.toLocaleString();

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-gray-700 font-thai">{title}</span>
                <span className="text-xs text-gray-500">{displayValue} / {displayGoal}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const BirthdayReport: React.FC = () => {
    const { getTodaysBirthdaysGlobally, getThisMonthsBirthdays } = useLeads();
    const todaysBirthdays = getTodaysBirthdaysGlobally();
    const thisMonthsBirthdays = getThisMonthsBirthdays();

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-lg font-bold text-gray-800 font-thai mb-4">Birthday Report</h3>
             <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-700 font-thai">Today's Birthdays ({todaysBirthdays.length})</h4>
                    {todaysBirthdays.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600 max-h-24 overflow-y-auto">
                            {todaysBirthdays.map(lead => (
                                <li key={lead.id}>🎂 {lead.first_name} {lead.last_name} ({lead.assigned_sales_name})</li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-gray-500 mt-1">No birthdays today.</p>}
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-700 font-thai">This Month's Birthdays ({thisMonthsBirthdays.length})</h4>
                    {thisMonthsBirthdays.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600 max-h-24 overflow-y-auto">
                            {thisMonthsBirthdays.map(lead => (
                                <li key={lead.id}>🎉 {lead.first_name} {lead.last_name} ({lead.assigned_sales_name})</li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-gray-500 mt-1">No birthdays this month.</p>}
                </div>
             </div>
        </div>
    )
}

const AdminView: React.FC = () => {
  const { leads } = useLeads();
  const { salesRoster } = useAuth();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const { stats, performance, goalStats } = useMemo(() => {
    const totalLeads = leads.length;
    const closedWonLeads = leads.filter(l => l.call_status === CallStatus.ClosedWon);
    const totalSalesValue = closedWonLeads.reduce((sum, lead) => sum + lead.sale_value, 0);
    const conversionRate = totalLeads > 0 ? (closedWonLeads.length / totalLeads) * 100 : 0;
    
    const statsData = {
        totalLeads,
        totalSalesValue,
        conversionRate: `${conversionRate.toFixed(1)}%`,
        uncalledLeads: leads.filter(l => l.call_status === CallStatus.Uncalled).length,
    };
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const goalStatsData = {
        newCustomers: leads.filter(l => l.created_at > thirtyDaysAgo).length,
        opportunities: leads.filter(l => [CallStatus.Contacted, CallStatus.Appointment, CallStatus.FollowUp, CallStatus.Negotiation, CallStatus.Quotation].includes(l.call_status)).length,
        revenue: totalSalesValue,
        profit: totalSalesValue * 0.6341, // Mock profit margin
    };

    const performanceData = salesRoster.map(sales => {
        const salesLeads = leads.filter(l => l.assigned_sales_id === sales.id);
        const salesClosedWon = salesLeads.filter(l => l.call_status === CallStatus.ClosedWon);
        const salesValue = salesClosedWon.reduce((sum, lead) => sum + lead.sale_value, 0);
        const statusCounts = salesLeads.reduce((acc, lead) => {
            acc[lead.call_status] = (acc[lead.call_status] || 0) + 1;
            return acc;
        }, {} as {[key: string]: number});

        return {
            name: sales.name,
            leadsCount: salesLeads.length,
            salesValue,
            conversionRate: salesLeads.length > 0 ? (salesClosedWon.length / salesLeads.length) * 100 : 0,
            statusCounts: {
                contacted: statusCounts[CallStatus.Contacted] || 0,
                quotation: statusCounts[CallStatus.Quotation] || 0,
                negotiation: statusCounts[CallStatus.Negotiation] || 0,
                lost: statusCounts[CallStatus.ClosedLost] || 0,
                won: statusCounts[CallStatus.ClosedWon] || 0,
            }
        };
    }).sort((a,b) => b.salesValue - a.salesValue);

    return { stats: statsData, performance: performanceData, goalStats: goalStatsData };
  }, [leads, salesRoster]);
  
  const handleExport = () => {
    if (performance.length === 0) return;
    const dataToExport = performance.map(p => ({
      "Salesperson": p.name,
      "Leads Count": p.leadsCount,
      "Sales Value": p.salesValue,
      "Conversion Rate (%)": p.conversionRate.toFixed(2),
      "Contacted": p.statusCounts.contacted,
      "Quotation": p.statusCounts.quotation,
      "Negotiation": p.statusCounts.negotiation,
      "Lost": p.statusCounts.lost,
      "Won": p.statusCounts.won,
    }));

    const csvRows = [];
    const headers = Object.keys(dataToExport[0]);
    csvRows.push(headers.join(','));

    for (const row of dataToExport) {
        const values = headers.map(header => {
            const escaped = (''+row[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8,' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'sales_performance_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 font-thai">แผนบริหาร</h2>
                <p className="text-sm text-gray-500 mt-1">ภาพรวมประสิทธิภาพของทีมขายทั้งหมด</p>
            </div>
             <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                <button onClick={handleExport} className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium text-sm transition-colors flex items-center">
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    Export CSV
                </button>
                <button onClick={() => setIsFormModalOpen(true)} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-gray-900 font-medium text-sm transition-colors flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    ลงเทิร์น
                </button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Total Leads" value={stats.totalLeads} change={5.45} icon={<UsersIcon className="w-6 h-6 text-gray-400"/>} />
            <StatCard title="Total Sales" value={`฿${(stats.totalSalesValue/1000).toFixed(1)}K`} change={4.59} icon={<PresentationChartLineIcon className="w-6 h-6 text-gray-400"/>} />
            <StatCard title="Conversion Rate" value={stats.conversionRate} change={1.2} icon={<CalendarIcon className="w-6 h-6 text-gray-400"/>} />
            <StatCard title="Uncalled Leads" value={stats.uncalledLeads} change={-3.43} icon={<ChartBarIcon className="w-6 h-6 text-gray-400"/>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5">
                 <h3 className="text-lg font-bold text-gray-800 font-thai">เป้าหมาย</h3>
                 <GoalProgress title="ลูกค้าใหม่" value={goalStats.newCustomers} goal={200} />
                 <GoalProgress title="โอกาส" value={goalStats.opportunities} goal={162} />
                 <GoalProgress title="ยอดขาย (รายได้)" value={goalStats.revenue} goal={3834000} formatAsCurrency />
                 <GoalProgress title="กำไร (%)" value={63.41} goal={100} />
            </div>
            <div className="lg:col-span-2">
               <BirthdayReport />
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-lg font-bold text-gray-800 font-thai mb-4">Sales Performance</h3>
              <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left text-gray-500">
                       <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-thai">
                           <tr>
                               <th scope="col" className="px-4 py-3">ชื่อพนักงาน</th>
                               <th scope="col" className="px-4 py-3 text-center">Leads</th>
                               <th scope="col" className="px-4 py-3 text-center">Sales Value</th>
                               <th scope="col" className="px-4 py-3 text-center">Conv. Rate</th>
                               <th scope="col" className="px-4 py-3 text-center">Won</th>
                               <th scope="col" className="px-4 py-3 text-center">Lost</th>
                           </tr>
                       </thead>
                       <tbody>
                           {performance.map((p) => (
                               <tr key={p.name} className="bg-white border-b hover:bg-gray-50">
                                   <td className="px-4 py-4 font-medium text-gray-900">{p.name}</td>
                                   <td className="px-4 py-4 text-center">{p.leadsCount}</td>
                                   <td className="px-4 py-4 text-center">฿{p.salesValue.toLocaleString()}</td>
                                   <td className="px-4 py-4 text-center">{p.conversionRate.toFixed(1)}%</td>
                                   <td className="px-4 py-4 text-center text-green-500 font-medium">{p.statusCounts.won || 0}</td>
                                   <td className="px-4 py-4 text-center text-red-500 font-medium">{p.statusCounts.lost || 0}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
        </div>


        {isFormModalOpen && <AdminLeadFormModal onClose={() => setIsFormModalOpen(false)} />}
    </div>
  );
};

// --- Modal for Admin Lead Form ---

const AdminLeadFormModal: React.FC<{onClose: () => void}> = ({onClose}) => {
  const { addLead } = useLeads();
  const { salesRoster, user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [program, setProgram] = useState<Program>(Program.General);
  const [manualAssignee, setManualAssignee] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !program) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, นามสกุล, เบอร์โทร)' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);

    const result = await addLead({
      first_name: firstName,
      last_name: lastName,
      phone,
      birth_date: birthDate || null,
      address,
      program,
      admin_submitter: user?.name || 'Admin',
      // The context will use this name to find the correct sales person ID
      assigned_sales_name: manualAssignee,
    } as any);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setFirstName(''); setLastName(''); setPhone(''); setBirthDate(''); setAddress(''); setProgram(Program.General); setManualAssignee('');
      setTimeout(() => {
          setMessage(null);
          onClose();
      }, 2000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setIsLoading(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-2xl w-full relative transform transition-all" >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
             <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 font-thai">ลงเทิร์น (Admin Lead Form)</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1 font-thai">ชื่อจริง</label>
                        <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition" placeholder="สมชาย"/>
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1 font-thai">นามสกุล</label>
                        <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition" placeholder="ใจดี"/>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 font-thai">เบอร์โทร</label>
                        <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition" placeholder="0812345678"/>
                    </div>
                    <div>
                        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1 font-thai">วันเดือนปีเกิด (ถ้ามี)</label>
                        <input type="date" id="birthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition"/>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 font-thai">ที่อยู่ (ถ้ามี)</label>
                        <textarea id="address" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition" placeholder="123 ถ.สุขุมวิท กรุงเทพฯ"></textarea>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1 font-thai">โปรแกรมที่สนใจ</label>
                        <select id="program" value={program} onChange={(e) => setProgram(e.target.value as Program)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition bg-white">
                            {Object.values(Program).map((p) => (<option key={p} value={p}>{p}</option>))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">Assign to Sales</label>
                        <select id="assignee" value={manualAssignee} onChange={(e) => setManualAssignee(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition bg-white">
                            <option value="">Automatic Assignment</option>
                            {salesRoster.map(s => (
                                <option key={s.id} value={s.name}>{s.name} ({s.status})</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {message && (
                <div className={`p-4 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
                )}

                <div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-secondary hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50">
                        {isLoading ? 'Submitting...' : 'Submit Lead'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}


export default AdminView;
