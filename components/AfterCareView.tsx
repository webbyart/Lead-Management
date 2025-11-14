import React, { useState } from 'react';
import { useLeads } from '../services/LeadContext';

const AfterCareView: React.FC = () => {
  const { addAppointments, appointments } = useLeads();
  const [customerName, setCustomerName] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !serviceDate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    setTimeout(() => {
      const baseDate = new Date(serviceDate);
      addAppointments(customerName, baseDate, 'After Care');
      
      setMessage(`สร้าง 5 นัดหมายสำหรับคุณ ${customerName} สำเร็จ! (จำลองการสร้างใน Google Calendar)`);
      setIsLoading(false);
      
      setCustomerName('');
      setServiceDate('');
      setTimeout(() => setMessage(null), 5000);
    }, 1500);
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

          {/* Appointments List Section */}
           <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4 font-thai">Upcoming After-Care Appointments</h2>
            {appointments.length > 0 ? (
              <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {appointments.filter(a => a.assignedTo === 'After Care').map(appt => (
                  <li key={appt.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start space-x-4">
                     <div className="flex-shrink-0 text-center">
                        <p className="text-secondary font-bold text-lg">{appt.appointmentDate.toLocaleDateString('en-US', { day: '2-digit' })}</p>
                        <p className="text-gray-500 text-xs">{appt.appointmentDate.toLocaleDateString('en-US', { month: 'short' })}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{appt.customerName}</p>
                        <p className="text-sm text-gray-500">
                          {appt.appointmentDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                          <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-800 text-xs rounded-full">{appt.followUpType}</span>
                        </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No appointments scheduled yet.</p>
              </div>
            )}
           </div>
        </div>
    </div>
  );
};

export default AfterCareView;