import React, { useState } from 'react';
import { useLeads } from '../services/LeadContext';
import { Program } from '../types';

const CustomerRegistrationForm: React.FC = () => {
  const { addLead } = useLeads();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [program, setProgram] = useState<Program>(Program.General);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !program || !appointmentDate) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);

    setTimeout(() => {
      const result = addLead({
        firstName,
        lastName,
        phone,
        birthDate: birthDate || null,
        address,
        program,
        appointmentDate: appointmentDate || null,
        adminSubmitter: 'Web Registration',
        assignedSales: '', // Let context handle auto-assignment
      }, true); // isFromAdmin = true to trigger round-robin

      if (result.success) {
        setMessage({ type: 'success', text: `ลงทะเบียนสำเร็จ! ทีมงานจะติดต่อกลับเร็วที่สุด` });
        setFirstName('');
        setLastName('');
        setPhone('');
        setBirthDate('');
        setAddress('');
        setProgram(Program.General);
        setAppointmentDate('');
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md h-fit border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 font-thai">ลงทะเบียนรับบริการ</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="custFirstName" className="block text-sm font-medium text-gray-700 mb-1 font-thai">ชื่อจริง</label>
                <input type="text" id="custFirstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition" required/>
            </div>
            <div>
                <label htmlFor="custLastName" className="block text-sm font-medium text-gray-700 mb-1 font-thai">นามสกุล</label>
                <input type="text" id="custLastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition" required/>
            </div>
            <div>
                <label htmlFor="custPhone" className="block text-sm font-medium text-gray-700 mb-1 font-thai">เบอร์โทร</label>
                <input type="tel" id="custPhone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition" required/>
            </div>
            <div>
                <label htmlFor="custBirthDate" className="block text-sm font-medium text-gray-700 mb-1 font-thai">วันเดือนปีเกิด (ถ้ามี)</label>
                <input type="date" id="custBirthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition"/>
            </div>
            <div className="md:col-span-2">
                <label htmlFor="custAddress" className="block text-sm font-medium text-gray-700 mb-1 font-thai">ที่อยู่ (ถ้ามี)</label>
                <textarea id="custAddress" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition"></textarea>
            </div>
            <div>
                <label htmlFor="custProgram" className="block text-sm font-medium text-gray-700 mb-1 font-thai">โปรแกรมที่สนใจ</label>
                <select id="custProgram" value={program} onChange={(e) => setProgram(e.target.value as Program)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition bg-white">
                    {Object.values(Program).map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
            </div>
            <div>
                <label htmlFor="custAppointmentDate" className="block text-sm font-medium text-gray-700 mb-1 font-thai">จองวันที่/เวลา</label>
                <input type="datetime-local" id="custAppointmentDate" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition" required/>
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
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-secondary bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50 transition-colors"
            >
            {isLoading ? 'Submitting...' : 'Register'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerRegistrationForm;