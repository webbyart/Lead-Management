import React, { useState, useMemo } from 'react';
import { useLeads } from '../services/LeadContext';
import { useAuth } from '../services/AuthContext';
import { Program, SalesPerson, CallStatus } from '../types';
// FIX: Imported missing icon components
import { PlusIcon, DocumentArrowDownIcon, UsersIcon, PresentationChartLineIcon, CalendarIcon, ChartBarIcon } from './Icons';

const StatCard: React.FC<{ title: string; value: string | number; change: number; icon: React.ReactNode; }> = ({ title, value, change, icon }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 font-thai">{title}</p>
            {icon}
        </div>
        <div className="mt-2">
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            <div className="flex items-center text-sm mt-1">
                <span className={`flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change >= 0 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.707l-3-3a1 1 0 011.414-1.414L9 10.586V7a1 1 0 112 0v3.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                    {Math.abs(change).toFixed(2)}%
                </span>
                <span className="text-gray-500 ml-1">vs last month</span>
            </div>
        </div>
    </div>
);

const GoalProgress: React.FC<{title: string, value: number, goal: number, formatAsCurrency?: boolean}> = ({ title, value, goal, formatAsCurrency }) => {
    const percentage = Math.min((value / goal) * 100, 100);
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

const StatusPieChart: React.FC<{ data: {name: string, value: number}[] }> = ({ data }) => {
    const colors = ['#34D399', '#60A5FA', '#FBBF24', '#A78BFA', '#F87171'];
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-full"><p className="text-gray-500">No data to display</p></div>;
    
    let cumulativePercent = 0;
    const gradients = data.map((item, index) => {
        const percent = (item.value / total) * 100;
        const color = colors[index % colors.length];
        const gradientPart = `${color} ${cumulativePercent}% ${cumulativePercent + percent}%`;
        cumulativePercent += percent;
        return gradientPart;
    });

    return (
        <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full" style={{ background: `conic-gradient(${gradients.join(', ')})` }}></div>
             <div className="mt-4 w-full space-y-2">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                            <span className="font-thai">{item.name}</span>
                        </div>
                        <span className="font-semibold text-gray-700">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminView: React.FC = () => {
  const { getDashboardStats } = useLeads();
  const { salesRoster } = useAuth();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const { stats, performance, statusDistribution, goalStats } = useMemo(() => getDashboardStats(), [getDashboardStats]);

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 font-thai">แผนบริหาร</h2>
                <p className="text-sm text-gray-500 mt-1">ภาพรวมประสิทธิภาพของทีมขายทั้งหมด</p>
            </div>
             <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                <button onClick={() => {}} className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium text-sm transition-colors flex items-center">
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    Export
                </button>
                <button onClick={() => setIsFormModalOpen(true)} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-gray-900 font-medium text-sm transition-colors flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    ลงเทิร์น
                </button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="จำนวนลูกค้าเคลื่อนไหว" value={stats.totalLeads} change={5.45} icon={<UsersIcon className="w-6 h-6 text-gray-400"/>} />
            <StatCard title="ยอดขาย" value={`฿${(stats.totalSalesValue/1000).toFixed(1)}K`} change={4.59} icon={<PresentationChartLineIcon className="w-6 h-6 text-gray-400"/>} />
            <StatCard title="รอชำระเงิน" value={`฿${(stats.awaitingPayment/1000).toFixed(1)}K`} change={-0.24} icon={<CalendarIcon className="w-6 h-6 text-gray-400"/>} />
            <StatCard title="คาดการณ์ยอดใหม่" value={`฿${(stats.forecast/1000).toFixed(1)}K`} change={-3.43} icon={<ChartBarIcon className="w-6 h-6 text-gray-400"/>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5">
                 <h3 className="text-lg font-bold text-gray-800 font-thai">เป้าหมาย</h3>
                 <GoalProgress title="ลูกค้าใหม่" value={goalStats.newCustomers} goal={200} />
                 <GoalProgress title="โอกาส" value={goalStats.opportunities} goal={162} />
                 <GoalProgress title="ยอดขาย (รายได้)" value={goalStats.revenue} goal={3834000} formatAsCurrency />
                 <GoalProgress title="กำไร (%)" value={63.41} goal={100} />
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 font-thai mb-4">สถานะงาน</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="md:col-span-1">
                       <StatusPieChart data={statusDistribution} />
                   </div>
                   <div className="md:col-span-2">
                       <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left text-gray-500">
                               <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-thai">
                                   <tr>
                                       <th scope="col" className="px-4 py-3">ชื่อพนักงาน</th>
                                       <th scope="col" className="px-4 py-3 text-center">โอกาสใหม่</th>
                                       <th scope="col" className="px-4 py-3 text-center">เสนอราคา</th>
                                       <th scope="col" className="px-4 py-3 text-center">ต่อรอง</th>
                                       <th scope="col" className="px-4 py-3 text-center">Lost</th>
                                       <th scope="col" className="px-4 py-3 text-center">Win</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {performance.slice(0, 6).map((p) => (
                                       <tr key={p.name} className="bg-white border-b hover:bg-gray-50">
                                           <td className="px-4 py-4 font-medium text-gray-900">{p.name}</td>
                                           <td className="px-4 py-4 text-center">{p.statusCounts.contacted}</td>
                                           <td className="px-4 py-4 text-center">{p.statusCounts.quotation}</td>
                                           <td className="px-4 py-4 text-center">{p.statusCounts.negotiation}</td>
                                           <td className="px-4 py-4 text-center text-red-500 font-medium">{p.statusCounts.lost}</td>
                                           <td className="px-4 py-4 text-center text-green-500 font-medium">{p.statusCounts.won}</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   </div>
                </div>
            </div>
        </div>

        {isFormModalOpen && <AdminLeadFormModal onClose={() => setIsFormModalOpen(false)} />}
    </div>
  );
};

// --- Modal for Admin Lead Form ---

const AdminLeadFormModal: React.FC<{onClose: () => void}> = ({onClose}) => {
  const { addLead } = useLeads();
  const { salesRoster } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [program, setProgram] = useState<Program>(Program.General);
  const [manualAssignee, setManualAssignee] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const adminProfile = { name: 'Admin' };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !program) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, นามสกุล, เบอร์โทร)' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);

    setTimeout(() => {
      const result = addLead({
        firstName, lastName, phone,
        birthDate: birthDate || null,
        address, program,
        adminSubmitter: adminProfile.name,
        assignedSales: manualAssignee,
      });

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
    }, 1000);
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
                        <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition" placeholder="123 ถ.สุขุมวิท กรุงเทพฯ"></textarea>
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
