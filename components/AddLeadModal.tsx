import React, { useState } from 'react';
import { useLeads } from '../services/LeadContext';
import { Program, SalesPerson } from '../types';

interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    salesPerson: SalesPerson;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, salesPerson }) => {
    const { addLead } = useLeads();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [address, setAddress] = useState('');
    const [program, setProgram] = useState<Program>(Program.General);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName || !lastName || !phone) {
            setMessage({ type: 'error', text: 'Please fill in First Name, Last Name, and Phone.' });
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
            admin_submitter: `Added by ${salesPerson.name}`,
            assigned_sales_name: salesPerson.name,
        } as any);

        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            // Reset form
            setFirstName('');
            setLastName('');
            setPhone('');
            setBirthDate('');
            setAddress('');
            setProgram(Program.General);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-2xl w-full relative transform transition-all">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 font-thai">ลงทะเบียน Lead ใหม่</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition" />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition" />
                        </div>
                         <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Birth Date (Optional)</label>
                            <input type="date" id="birthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition"/>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                            <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition"></textarea>
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">Program of Interest</label>
                            <select id="program" value={program} onChange={(e) => setProgram(e.target.value as Program)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition bg-white">
                                {Object.values(Program).map((p) => (<option key={p} value={p}>{p}</option>))}
                            </select>
                        </div>
                    </div>
                     {message && (
                      <div className={`p-4 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                      </div>
                    )}
                     <div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-secondary hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? 'Saving...' : 'Submit Lead'}
                      </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLeadModal;