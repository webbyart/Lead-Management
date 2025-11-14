import React, { useState } from 'react';
import { useLeads } from '../services/LeadContext';

const AfterCareView: React.FC = () => {
  const { addAppointments, appointments } = useLeads();
  const [customerName, setCustomerName] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !serviceDate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const baseDate = new Date(serviceDate);
    await addAppointments(customerName, baseDate, 'After Care', `after-care-${Date.now()}`);
    
    setMessage(`สร้าง 5 นัดหมายสำหรับคุณ ${customerName} สำเร็จ!`);
    setIsLoading(false);
    
    setCustomerName('');
    setServiceDate('');
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 font-thai">After-Care</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4 font-thai">ตั้งนัดหมาย Follow-Up</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="customerNameAC" className="block text-sm font-medium text-gray-700 mb-1 font-thai">ชื่อ-นามสกุล ลูกค้า</label>
                <input
                  type="text"
                  id="customerNameAC"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition"
                  placeholder="ชื่อลูกค้าที่รับบริการ"
                />
              </div>
              <div>
                <label htmlFor="serviceDate" className="block text-sm font-medium text-gray-700 mb-1 font-thai">วันที่รับบริการ</label>
                <input
                  type="date"
                  id="serviceDate"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-dark focus:border-primary-dark transition"
                />
              </div>
              {message && (
                 <div className="p-4 rounded-lg text-center bg-green-100 text-green-800">
                    {message}
                 </div>
               )}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-secondary hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Schedule Follow-Ups'}
                </button>
              </div>
            </form>
          </div>

          {/* Appointment List Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 font-thai">Upcoming Follow-Ups</h2>
            <ul className="space-y-3 h-[450px] overflow-y-auto pr-2">
                {appointments.length > 0 ? (
                [...appointments]
                    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                    .map(appt => (
                    <li key={appt.id} className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                        <p className="font-bold text-indigo-800">{appt.customer_name}</p>
                        <p className="text-sm text-indigo-700">{appt.follow_up_type}</p>
                        <p className="text-xs mt-1 font-medium text-gray-500">
                            {new Date(appt.appointment_date).toLocaleString()}
                        </p>
                    </li>
                    ))
                ) : (
                    <p className="text-gray-500 text-center pt-16">No upcoming appointments.</p>
                )}
            </ul>
          </div>
        </div>
    </div>
  );
};

export default AfterCareView;