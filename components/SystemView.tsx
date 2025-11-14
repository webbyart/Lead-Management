import React, { useState } from 'react';
import { useLeads } from '../services/LeadContext';
import { Lead } from '../types';

type Result = {
  title: string;
  message: string;
  data: any[];
}

const SystemView: React.FC = () => {
  const { checkReminders, reassignIdleLeads, checkFollowUpTasks, getTodaysBirthdaysGlobally } = useLeads();
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = (action: () => any, title: string) => {
    setIsLoading(title);
    setResult(null);
    setTimeout(() => {
        const actionResult = action();
        
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
    }, 1000);
  };
  
  const renderResultData = () => {
      if (!result || result.data.length === 0) return null;
      
      switch(result.title) {
          case 'แจ้งเตือน Lead ค้าง (> 10 นาที)':
          case 'เตือน Follow-Up (วันนี้)':
              return (
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {(result.data as Lead[]).map(lead => (
                          <li key={lead.id}>{lead.firstName} {lead.lastName} ({lead.phone}) - มอบหมายให้ {lead.assignedSales}</li>
                      ))}
                  </ul>
              );
          case 'เด้งงาน Lead ค้าง (> 24 ชม.)':
               return (
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {(result.data as {leadId: string, oldSales: string, newSales: string}[]).map(item => (
                          <li key={item.leadId}>Lead ID {item.leadId.slice(-4)}: ย้ายจาก {item.oldSales} -> {item.newSales}</li>
                      ))}
                  </ul>
              );
          case "Check Today's Birthdays":
              return (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {(result.data as Lead[]).map(lead => (
                    <li key={lead.id}>
                      🎂 {lead.firstName} {lead.lastName} (Client of <span className="font-semibold">{lead.assignedSales}</span>)
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
    </div>
  );
};

export default SystemView;