import React from 'react';
import { Lead, CallStatus, Program } from '../types';

interface LeadCardProps {
    lead: Lead;
    onSelect: (lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onSelect }) => {
    
    const getStatusChipColor = (status: CallStatus) => {
        switch (status) {
            case CallStatus.Uncalled: return 'bg-gray-200 text-gray-800';
            case CallStatus.Contacted:
            case CallStatus.FollowUp:
                return 'bg-blue-200 text-blue-800';
            case CallStatus.Appointment:
            case CallStatus.Quotation:
            case CallStatus.Negotiation:
                return 'bg-yellow-200 text-yellow-800';
            case CallStatus.ClosedWon: return 'bg-green-200 text-green-800';
            case CallStatus.ClosedLost: return 'bg-red-200 text-red-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    const calculateAge = (dobString: string | null) => {
        if (!dobString) return null;
        const birthDate = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = calculateAge(lead.birth_date);
    
    const getPriorityStyles = () => {
        const now = new Date();
        const createdAt = new Date(lead.created_at);
        // An uncalled lead is high priority if it's older than 1 hour.
        const highPriorityTimeLimit = new Date(now.getTime() - 60 * 60 * 1000);
        const todayStr = now.toISOString().slice(0, 10);
        
        // High Priority (RED): Overdue follow-ups OR uncalled for over an hour.
        if (
            (lead.follow_up_date && lead.follow_up_date < todayStr) ||
            (lead.call_status === CallStatus.Uncalled && createdAt < highPriorityTimeLimit)
        ) {
            return 'border-l-4 border-red-500';
        }

        // Medium Priority (AMBER): Follow-ups for today OR any uncalled lead.
        if (
            (lead.follow_up_date && lead.follow_up_date === todayStr) ||
            lead.call_status === CallStatus.Uncalled
        ) {
            return 'border-l-4 border-amber-500';
        }
        
        // Default style for other leads
        return 'border-l-4 border-transparent';
    };


    return (
        <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200 ${getPriorityStyles()}`}>
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{lead.first_name} {lead.last_name}</h3>
                        <p className="text-sm text-gray-600">{lead.phone} | {lead.program}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusChipColor(lead.call_status)}`}>
                        {lead.call_status}
                    </span>
                </div>
                <div className="mt-3 text-sm text-gray-700 space-y-1 border-t pt-3">
                    {lead.birth_date && (
                        <p><strong>Birthday:</strong> {new Date(lead.birth_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} ({age} years)</p>
                    )}
                    {lead.address && <p><strong>Address:</strong> {lead.address}</p>}
                    <p className="text-xs text-gray-500 pt-2">
                        Received: {new Date(lead.created_at).toLocaleString()} from {lead.admin_submitter}
                    </p>
                </div>
            </div>
            <div className="mt-4 pt-3 border-t">
                 <button onClick={() => onSelect(lead)} className="w-full text-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium">
                    Edit / Update
                </button>
            </div>
        </div>
    );
};

export default LeadCard;