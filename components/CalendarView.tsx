import React, { useState, useMemo } from 'react';
import { useLeads } from '../services/LeadContext';
import { Lead, Appointment } from '../types';

interface CalendarEvent {
    id: string;
    date: Date;
    title: string;
    type: 'Sales Follow-Up' | 'After-Care';
    assignedTo: string;
    bgColor: string;
    textColor: string;
}

const CalendarView: React.FC = () => {
    const { leads, appointments } = useLeads();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const events = useMemo(() => {
        const allEvents: CalendarEvent[] = [];
        
        // Process sales follow-ups
        leads.forEach(lead => {
            if (lead.followUpDate) {
                allEvents.push({
                    id: `lead-${lead.id}`,
                    date: new Date(lead.followUpDate + 'T00:00:00'), // Ensure correct date parsing
                    title: `${lead.firstName} ${lead.lastName}`,
                    type: 'Sales Follow-Up',
                    assignedTo: lead.assignedSales,
                    bgColor: 'bg-purple-100',
                    textColor: 'text-purple-800'
                });
            }
        });

        // Process after-care appointments
        appointments.forEach(appt => {
            allEvents.push({
                id: `appt-${appt.id}`,
                date: appt.appointmentDate,
                title: appt.customerName,
                type: 'After-Care',
                assignedTo: 'After Care',
                bgColor: 'bg-indigo-100',
                textColor: 'text-indigo-800'
            });
        });

        return allEvents;
    }, [leads, appointments]);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        events.forEach(event => {
            const key = event.date.toISOString().split('T')[0];
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key)?.push(event);
        });
        return map;
    }, [events]);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const calendarDays: Date[] = [];
    let date = new Date(startDate);
    while (date <= endDate) {
        calendarDays.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const selectedDayEvents = useMemo(() => {
        const key = selectedDate.toISOString().split('T')[0];
        return eventsByDate.get(key) || [];
    }, [selectedDate, eventsByDate]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 font-thai">ปฏิทิน</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">&lt;</button>
                        <h2 className="text-xl font-bold text-gray-800">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">&gt;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500">
                        {weekDays.map(day => <div key={day} className="py-2">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            const dayKey = day.toISOString().split('T')[0];
                            const isToday = dayKey === new Date().toISOString().split('T')[0];
                            const isSelected = dayKey === selectedDate.toISOString().split('T')[0];
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                            const dailyEvents = eventsByDate.get(dayKey) || [];

                            return (
                                <div 
                                    key={index} 
                                    className={`h-24 p-1.5 border rounded-lg cursor-pointer transition-colors ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} ${isSelected ? 'border-primary-dark border-2' : 'border-gray-200 hover:bg-amber-50'}`}
                                    onClick={() => setSelectedDate(day)}
                                >
                                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-sm ${isToday ? 'bg-secondary text-white' : ''} ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}`}>
                                        {day.getDate()}
                                    </div>
                                    <div className="mt-1 space-y-0.5 overflow-hidden">
                                        {dailyEvents.slice(0,2).map(event => (
                                            <div key={event.id} className={`w-full h-1.5 rounded-full ${event.type === 'Sales Follow-Up' ? 'bg-purple-400' : 'bg-indigo-400'}`}></div>
                                        ))}
                                        {dailyEvents.length > 2 && <div className="text-xs text-gray-500">+ {dailyEvents.length - 2} more</div>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                        Events for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    {selectedDayEvents.length > 0 ? (
                        <ul className="space-y-3 h-96 overflow-y-auto pr-2">
                            {selectedDayEvents.map(event => (
                                <li key={event.id} className={`p-3 rounded-lg ${event.bgColor} ${event.textColor}`}>
                                    <p className="font-bold">{event.title}</p>
                                    <p className="text-sm">{event.type}</p>
                                    <p className="text-xs mt-1 font-medium">Assigned to: {event.assignedTo}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96 text-center">
                            <p className="text-gray-500">No events for this day.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;