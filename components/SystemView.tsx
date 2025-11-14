import React, { useState } from 'react';
import { useLeads } from '../services/LeadContext';
import { Lead, SalesPerson } from '../types';
import { useAuth } from '../services/AuthContext';

type Result = {
  title: string;
  message: string;
  data: any[];
}

const SalesManagementPanel: React.FC = () => {
    const { salesRoster, deleteSalesPerson } = useAuth();
    const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
    const [editingSales, setEditingSales] = useState<SalesPerson | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const openAddModal = () => {
        setEditingSales(null);
        setIsSalesModalOpen(true);
    };

    const openEditModal = (sales: SalesPerson) => {
        setEditingSales(sales);
        setIsSalesModalOpen(true);
    };

    const handleDeleteSales = async (sales: SalesPerson) => {
        if (window.confirm(`Are you sure you want to delete sales user "${sales.name}"? This cannot be undone.`)) {
            const result = await deleteSalesPerson(sales.id);
            setMessage({ type: result.success ? 'success' : 'error', text: result.message });
            setTimeout(() => setMessage(null), 4000);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800 font-thai">Manage Salespersons</h2>
                <button onClick={openAddModal} className="px-3 py-2 bg-primary text-secondary rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                    Add Sales
                </button>
            </div>
            {message && (
                <div className={`mb-4 p-3 rounded-lg text-center text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesRoster.map(sales => (
                            <tr key={sales.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{sales.name}</td>
                                <td className="px-4 py-3">{sales.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sales.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {sales.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <button onClick={() => openEditModal(sales)} className="font-medium text-primary-dark hover:underline">Edit</button>
                                    <button onClick={() => handleDeleteSales(sales)} className="font-medium text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isSalesModalOpen && (
                <SalesUserModal
                    isOpen={isSalesModalOpen}
                    onClose={() => setIsSalesModalOpen(false)}
                    salesPerson={editingSales}
                    onSuccess={(msg) => {
                        setMessage({ type: 'success', text: msg });
                        setTimeout(() => setMessage(null), 4000);
                        setIsSalesModalOpen(false);
                    }}
                    onFailure={(msg) => {
                        setMessage({ type: 'error', text: msg });
                    }}
                />
            )}
        </div>
    )
}

const SystemView: React.FC = () => {
  const { checkReminders, reassignIdleLeads, checkFollowUpTasks, getTodaysBirthdaysGlobally } = useLeads();
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (action: () => Promise<any> | any, title: string) => {
    setIsLoading(title);
    setResult(null);
    
    const actionResult = await action();
    
    if (title === 'เด้งงาน Lead ค้าง (> 24 ชม.)') {
        setResult({
            title,
            message: actionResult.message,
            data: actionResult.reassignments
        });
    } else {
        setResult({
            title,
            message: actionResult.length > 0 ? `พบ ${actionResult.length} รายการ` : 'ไม่พบรายการที่เข้าเงื่อนไข',
            data: actionResult
        });
    }

    setIsLoading(null);
  };
  
  const renderResultData = () => {
      if (!result || result.data.length === 0) return null;
      
      switch(result.title) {
          case 'แจ้งเตือน Lead ค้าง (> 10 นาที)':
          case 'เตือน Follow-Up (วันนี้)':
              return (
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {(result.data as Lead[]).map(lead => (
                          <li key={lead.id}>{lead.first_name} {lead.last_name} ({lead.phone}) - มอบหมายให้ {lead.assigned_sales_name}</li>
                      ))}
                  </ul>
              );
          case 'เด้งงาน Lead ค้าง (> 24 ชม.)':
               return (
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {(result.data as {leadId: string, oldSales: string, newSales: string}[]).map(item => (
                          <li key={item.leadId}>Lead ID ...{item.leadId.slice(-4)}: ย้ายจาก {item.oldSales} -> {item.newSales}</li>
                      ))}
                  </ul>
              );
          case "Check Today's Birthdays":
              return (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {(result.data as Lead[]).map(lead => (
                    <li key={lead.id}>
                      🎂 {lead.first_name} {lead.last_name} (Client of <span className="font-semibold">{lead.assigned_sales_name}</span>)
                    </li>
                  ))}
                </ul>
              );
          default:
              return null;
      }
  };

  const actions = [
    { title: 'แจ้งเตือน Lead ค้าง (> 10 นาที)', action: () => handleAction(checkReminders, 'แจ้งเตือน Lead ค้าง (> 10 นาที)'), description: 'ค้นหา Lead ที่ยังไม่ได้โทรและค้างเกิน 10 นาที' },
    { title: 'เด้งงาน Lead ค้าง (> 24 ชม.)', action: () => handleAction(reassignIdleLeads, 'เด้งงาน Lead ค้าง (> 24 ชม.)'), description: 'ย้าย Lead ที่ยังไม่ได้โทรและค้างเกิน 24 ชั่วโมงให้เซลล์คนถัดไป' },
    { title: 'เตือน Follow-Up (วันนี้)', action: () => handleAction(checkFollowUpTasks, 'เตือน Follow-Up (วันนี้)'), description: 'ค้นหา Lead ที่มีนัดหมายติดตามผลในวันนี้' },
    { title: "Check Today's Birthdays", action: () => handleAction(getTodaysBirthdaysGlobally, "Check Today's Birthdays"), description: "Simulates a daily system check for all customer birthdays." },
  ];

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 font-thai">ตั้งค่า / System Triggers</h2>
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4 font-thai">จำลองงานอัตโนมัติ</h2>
          <div className="space-y-4">
            {actions.map(({ title, action, description }) => (
              <div key={title} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h3 className="font-semibold text-gray-800 font-thai">{title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
                <button
                  onClick={action}
                  disabled={!!isLoading}
                  className="mt-3 sm:mt-0 w-full sm:w-auto flex-shrink-0 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-gray-900 transition-all text-sm font-medium disabled:opacity-50"
                >
                  {isLoading === title ? 'Checking...' : 'Run Check'}
                </button>
              </div>
            ))}
          </div>

          {result && !isLoading && (
            <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-bold text-secondary mb-2">{result.title} Result</h3>
              <p className="text-gray-700 font-medium mb-4">{result.message}</p>
              {renderResultData()}
            </div>
          )}
        </div>
        <SalesManagementPanel />
    </div>
  );
};

interface SalesUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    salesPerson: SalesPerson | null;
    onSuccess: (message: string) => void;
    onFailure: (message: string) => void;
}

const SalesUserModal: React.FC<SalesUserModalProps> = ({ isOpen, onClose, salesPerson, onSuccess, onFailure }) => {
    const { registerSales, updateSalesPerson } = useAuth();
    const [name, setName] = useState(salesPerson?.name || '');
    const [email, setEmail] = useState(salesPerson?.email || '');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        let result;
        if (salesPerson) { // Editing existing user
            result = await updateSalesPerson(salesPerson.id, { name });
        } else { // Adding new user
            result = await registerSales(name, email, password);
        }
        
        if (result.success) {
            onSuccess(result.message);
        } else {
            setError(result.message);
            onFailure(result.message);
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{salesPerson ? 'Edit' : 'Add'} Sales User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={!!salesPerson} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 disabled:cursor-not-allowed"/>
                    </div>
                    {!salesPerson && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-gray-900 disabled:opacity-50">
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default SystemView;
