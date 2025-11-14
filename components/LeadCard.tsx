import React, { useState } from 'react';
import { Lead, CallStatus, Program } from '../types';
import { useLeads } from '../services/LeadContext';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose }) => {
  const { updateLead, deleteLead } = useLeads();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState(lead.firstName);
  const [lastName, setLastName] = useState(lead.lastName);
  const [phone, setPhone] = useState(lead.phone);
  const [birthDate, setBirthDate] = useState(lead.birthDate || '');
  const [address, setAddress] = useState(lead.address);
  const [program, setProgram] = useState(lead.program);
  const [status, setStatus] = useState(lead.callStatus);
  const [saleValue, setSaleValue] = useState(lead.saleValue.toString());
  const [notes, setNotes] = useState(lead.notes);
  const [followUpDate, setFollowUpDate] = useState(lead.followUpDate || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdate = () => {
    setIsLoading(true);
    setMessage(null);
    const updates: Partial<Lead> = {
      firstName, lastName, phone,
      birthDate: birthDate || null,
      address, program, callStatus: status,
      saleValue: parseFloat(saleValue) || 0,
      notes, followUpDate: followUpDate || null,
    };

    setTimeout(() => {
        const result = updateLead(lead.id, updates);
        if (result.success) {
            setMessage({ type: 'success', text: result.message });
        } else {
            setMessage({ type: 'error', text: result.message });
        }
        setIsLoading(false);
        setTimeout(() => {
            setMessage(null);
            onClose();
        }, 1500);
    }, 1000);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the lead for ${lead.firstName} ${lead.lastName}?`)) {
        setIsLoading(true);
        setMessage(null);
        setTimeout(() => {
            const result = deleteLead(lead.id);
            if (result.success) {
                onClose();
            } else {
                setMessage({ type: 'error', text: result.message });
                setIsLoading(false);
            }
        }, 1000);
    }
  }
  
  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-4xl w-full relative transform transition-all">
            <div className="flex justify-between items-start">
                <div>
                     <h2 className="text-2xl font-bold text-gray-800 font-thai">รายละเอียดกิจกรรม</h2>
                     <p className="text-sm text-gray-500 mt-1">Lead ID: ...{lead.id.slice(-6)}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
          
            <div className="mt-6 border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    {/* Left Column: Form */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1 w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1 w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="mt-1 w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Program</label>
                                <select value={program} onChange={(e) => setProgram(e.target.value as Program)} className="mt-1 block w-full text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                    {Object.values(Program).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value as CallStatus)} className="mt-1 block w-full text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                    {Object.values(CallStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Sale Value</label>
                                <input type="number" value={saleValue} onChange={e => setSaleValue(e.target.value)} className="mt-1 w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Follow-Up Date</label>
                                <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="mt-1 w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Notes</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="mt-1 w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Meta Info & Actions */}
                    <div className="md:col-span-1 space-y-4">
                         <div className="bg-gray-50 p-4 rounded-lg border">
                             <h4 className="font-semibold text-gray-800 mb-2">ข้อมูล Lead</h4>
                             <div className="text-sm space-y-1 text-gray-600">
                                 <p><strong>ผู้มอบหมาย:</strong> {lead.adminSubmitter}</p>
                                 <p><strong>ได้รับเมื่อ:</strong> {new Date(lead.createdAt).toLocaleString()}</p>
                                 <p><strong>เซลล์ผู้รับผิดชอบ:</strong> {lead.assignedSales}</p>
                             </div>
                         </div>
                         <div className="bg-gray-50 p-4 rounded-lg border">
                             <h4 className="font-semibold text-gray-800 mb-2">การติดต่อ</h4>
                             <div className="text-sm space-y-1 text-gray-600">
                                <p>ยังไม่มีประวัติการติดต่อ</p>
                             </div>
                         </div>
                    </div>
                </div>

                {message && (
                    <div className={`mt-4 p-3 rounded-md text-center text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="mt-6 pt-6 border-t flex justify-between items-center">
                    <button onClick={handleDelete} disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium">
                        Delete Lead
                    </button>
                    <div className="space-x-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button onClick={handleUpdate} disabled={isLoading} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-gray-900 disabled:opacity-50">
                            {isLoading ? 'Saving...' : 'Save Update'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
  );
};

export default LeadDetailModal;
