import { Lead, SalesPerson, Program, CallStatus } from '../types';

export const salesRoster: SalesPerson[] = [
  { id: 'sales1', name: 'Alice', status: 'online', lineUserId: 'user_alice', email: 'sales1@email.com', password: '1234' },
  { id: 'sales2', name: 'Bob', status: 'online', lineUserId: 'user_bob', email: 'sales2@email.com', password: '1234' },
  { id: 'sales3', name: 'Charlie', status: 'offline', lineUserId: 'user_charlie', email: 'sales3@email.com', password: '1234' },
  { id: 'sales4', name: 'Diana', status: 'online', lineUserId: 'user_diana', email: 'sales4@email.com', password: '1234' },
  { id: 'sales5', name: 'Ethan', status: 'online', lineUserId: 'user_ethan', email: 'sales5@email.com', password: '1234' },
  { id: 'sales6', name: 'นัท', status: 'online', lineUserId: 'user_nut', email: 'nut@email.com', password: '1234' },
];

const getToday = () => new Date();
const getCurrentMonth = () => getToday().getMonth();
const getCurrentYear = () => getToday().getFullYear();

export const leads: Lead[] = [
    // --- Today's Birthday Leads ---
    {
        id: 'lead_today_bday_1',
        firstName: 'Today', lastName: 'Birthday', phone: '0810000001',
        birthDate: `${getCurrentYear() - 30}-${String(getCurrentMonth() + 1).padStart(2, '0')}-${String(getToday().getDate()).padStart(2, '0')}`,
        address: '1 Birthday Rd, Bangkok', program: Program.Premium, adminSubmitter: 'Admin A', assignedSales: 'Alice',
        callStatus: CallStatus.Contacted, saleValue: 0, notes: 'Birthday today!', followUpDate: null, createdAt: new Date(Date.now() - 86400000 * 2)
    },
    {
        id: 'lead_today_bday_2',
        firstName: 'Another', lastName: 'Birthday', phone: '0810000002',
        birthDate: `${getCurrentYear() - 25}-${String(getCurrentMonth() + 1).padStart(2, '0')}-${String(getToday().getDate()).padStart(2, '0')}`,
        address: '2 Celebration Ave, Phuket', program: Program.General, adminSubmitter: 'Admin B', assignedSales: 'Bob',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: '', followUpDate: null, createdAt: new Date(Date.now() - 3600000)
    },

    // --- This Month's Birthday Leads (Not Today) ---
    {
        id: 'lead_month_bday_1',
        firstName: 'Monthly', lastName: 'Special', phone: '0820000001',
        birthDate: `${getCurrentYear() - 40}-${String(getCurrentMonth() + 1).padStart(2, '0')}-01`,
        address: '3 Monthly St, Chiang Mai', program: Program.Consultation, adminSubmitter: 'Admin A', assignedSales: 'Alice',
        callStatus: CallStatus.FollowUp, saleValue: 0, notes: 'Call back next week', followUpDate: `${getCurrentYear()}-${String(getCurrentMonth() + 1).padStart(2, '0')}-28`, createdAt: new Date(Date.now() - 86400000 * 5)
    },
    
    // --- Leads for Alice (sales1) ---
    {
        id: 'lead1',
        firstName: 'John', lastName: 'Doe', phone: '0812345678', birthDate: '1990-05-15',
        address: '123 Main St, Bangkok', program: Program.Premium, adminSubmitter: 'Admin A', assignedSales: 'Alice',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: '', followUpDate: null, createdAt: new Date(Date.now() - 300000)
    },
    {
        id: 'lead5',
        firstName: 'Olivia', lastName: 'Chen', phone: '0811111111', birthDate: '1992-03-22',
        address: '101 Maple Dr, Bangkok', program: Program.General, adminSubmitter: 'Admin A', assignedSales: 'Alice',
        callStatus: CallStatus.Appointment, saleValue: 0, notes: 'Appointment set for next Monday', followUpDate: null, createdAt: new Date(Date.now() - 86400000 * 3)
    },
     {
        id: 'lead6',
        firstName: 'William', lastName: 'Taylor', phone: '0822222222', birthDate: '1988-07-11',
        address: '202 Oak Ln, Nonthaburi', program: Program.FixFaceLock, adminSubmitter: 'Admin B', assignedSales: 'Alice',
        callStatus: CallStatus.ClosedWon, saleValue: 50000, notes: 'Sale closed!', followUpDate: null, createdAt: new Date(Date.now() - 86400000 * 10)
    },

    // --- Leads for Bob (sales2) ---
    {
        id: 'lead2',
        firstName: 'Jane', lastName: 'Smith', phone: '0898765432', birthDate: '1995-09-05',
        address: '456 Oak Ave, Chiang Mai', program: Program.General, adminSubmitter: 'Admin B', assignedSales: 'Bob',
        callStatus: CallStatus.FollowUp, saleValue: 0, notes: 'Called, asked to call back tomorrow.', followUpDate: `${getToday().getFullYear()}-${String(getToday().getMonth() + 1).padStart(2, '0')}-${String(getToday().getDate() + 1).padStart(2, '0')}`, createdAt: new Date(Date.now() - 7200000)
    },
    {
        id: 'lead7',
        firstName: 'James', lastName: 'Johnson', phone: '0833333333', birthDate: '1991-01-30',
        address: '303 Pine St, Rayong', program: Program.Premium, adminSubmitter: 'Admin A', assignedSales: 'Bob',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: '', followUpDate: null, createdAt: new Date(Date.now() - 600000)
    },
    {
        id: 'lead8',
        firstName: 'Patricia', lastName: 'Williams', phone: '0844444444', birthDate: '1985-12-19',
        address: '404 Birch Rd, Chonburi', program: Program.Consultation, adminSubmitter: 'Admin C', assignedSales: 'Bob',
        callStatus: CallStatus.Contacted, saleValue: 0, notes: 'Interested, needs more info.', followUpDate: null, createdAt: new Date(Date.now() - 86400000 * 1)
    },

    // --- Leads for Charlie (sales3) ---
     {
        id: 'lead9',
        firstName: 'Robert', lastName: 'Brown', phone: '0855555555', birthDate: '1979-06-08',
        address: '505 Cedar Blvd, Samut Prakan', program: Program.General, adminSubmitter: 'Admin B', assignedSales: 'Charlie',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: '', followUpDate: null, createdAt: new Date(Date.now() - 900000)
    },
    {
        id: 'lead10',
        firstName: 'Jennifer', lastName: 'Jones', phone: '0866666666', birthDate: '1998-02-14',
        address: '606 Spruce Ct, Pathum Thani', program: Program.Premium, adminSubmitter: 'Admin A', assignedSales: 'Charlie',
        callStatus: CallStatus.ClosedLost, saleValue: 0, notes: 'Not interested in the price.', followUpDate: null, createdAt: new Date(Date.now() - 86400000 * 12)
    },
    {
        id: 'lead11',
        firstName: 'Michael', lastName: 'Garcia', phone: '0877777777', birthDate: '1993-10-25',
        address: '707 Elm St, Ayutthaya', program: Program.FixFaceLock, adminSubmitter: 'Admin C', assignedSales: 'Charlie',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: 'High priority.', followUpDate: null, createdAt: new Date(Date.now() - 120000)
    },

    // --- Leads for Diana (sales4) ---
    {
        id: 'lead12',
        firstName: 'Linda', lastName: 'Martinez', phone: '0888888888', birthDate: '1996-08-01',
        address: '808 Willow Way, Nakhon Ratchasima', program: Program.General, adminSubmitter: 'Admin A', assignedSales: 'Diana',
        callStatus: CallStatus.FollowUp, saleValue: 0, notes: 'Wants a discount.', followUpDate: `${getCurrentYear()}-${String(getCurrentMonth() + 1).padStart(2, '0')}-25`, createdAt: new Date(Date.now() - 86400000 * 4)
    },
     {
        id: 'lead13',
        firstName: 'David', lastName: 'Rodriguez', phone: '0899999999', birthDate: '1982-04-18',
        address: '909 Poplar Pl, Khon Kaen', program: Program.Premium, adminSubmitter: 'Admin B', assignedSales: 'Diana',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: '', followUpDate: null, createdAt: new Date(Date.now() - 1800000)
    },
    {
        id: 'lead14',
        firstName: 'Maria', lastName: 'Hernandez', phone: '0900000000', birthDate: '1990-11-02',
        address: '111 Aspen Ave, Udon Thani', program: Program.Consultation, adminSubmitter: 'Admin C', assignedSales: 'Diana',
        callStatus: CallStatus.Contacted, saleValue: 0, notes: 'Sent brochure via LINE.', followUpDate: null, createdAt: new Date(Date.now() - 86400000 * 2)
    },

    // --- Leads for Ethan (sales5) ---
    {
        id: 'lead15',
        firstName: 'Richard', lastName: 'Lopez', phone: '0911111111', birthDate: '1975-07-30',
        address: '222 Redwood Rd, Songkhla', program: Program.General, adminSubmitter: 'Admin A', assignedSales: 'Ethan',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: '', followUpDate: null, createdAt: new Date(Date.now() - 2400000)
    },
    {
        id: 'lead16',
        firstName: 'Susan', lastName: 'Gonzalez', phone: '0922222222', birthDate: '1989-09-12',
        address: '333 Sequoia St, Surat Thani', program: Program.FixFaceLock, adminSubmitter: 'Admin B', assignedSales: 'Ethan',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: '', followUpDate: null, createdAt: new Date(Date.now() - 300000)
    },
    {
        id: 'lead17',
        firstName: 'Joseph', lastName: 'Wilson', phone: '0933333333', birthDate: '2000-01-01',
        address: '444 Magnolia Blvd, Nakhon Si Thammarat', program: Program.Premium, adminSubmitter: 'Admin C', assignedSales: 'Ethan',
        callStatus: CallStatus.Appointment, saleValue: 0, notes: 'Booked for a video call.', followUpDate: null, createdAt: new Date(Date.now() - 86400000 * 6)
    },

    // --- Leads for นัท (sales6) ---
    {
        id: 'lead3',
        firstName: 'Peter', lastName: 'Pan', phone: '0888888889', birthDate: '1985-11-20',
        address: '789 Pine Rd, Phuket', program: Program.FixFaceLock, adminSubmitter: 'Admin A', assignedSales: 'นัท',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: 'Urgent case', followUpDate: null, createdAt: new Date(Date.now() - 1800000)
    },
    {
        id: 'lead4',
        firstName: 'Alice', lastName: 'Wonder', phone: '0811112222',
        birthDate: `${getCurrentYear() - 28}-${String(getCurrentMonth() + 1).padStart(2, '0')}-15`,
        address: '111 Wonderland', program: Program.Consultation, adminSubmitter: 'Admin A', assignedSales: 'นัท',
        callStatus: CallStatus.Contacted, saleValue: 0, notes: '', followUpDate: null, createdAt: new Date(Date.now() - 172800000)
    },
    
    // --- More filler leads ---
    {
        id: 'lead18',
        firstName: 'Karen', lastName: 'Moore', phone: '0944444444', birthDate: '1984-05-20',
        address: '555 Cypress Ln, Krabi', program: Program.General, adminSubmitter: 'Admin A', assignedSales: 'Alice',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: '', followUpDate: null, createdAt: new Date(Date.now() - 4800000)
    },
    {
        id: 'lead19',
        firstName: 'Thomas', lastName: 'Jackson', phone: '0955555555', birthDate: '1999-02-28',
        address: '666 Dogwood Dr, Trang', program: Program.Premium, adminSubmitter: 'Admin B', assignedSales: 'Bob',
        callStatus: CallStatus.Contacted, saleValue: 0, notes: 'Sent pricing details.', followUpDate: null, createdAt: new Date(Date.now() - 86400000 * 3)
    },
    {
        id: 'lead20',
        firstName: 'Nancy', lastName: 'White', phone: '0966666666', birthDate: '1978-08-08',
        address: '777 Holly Ct, Phatthalung', program: Program.Consultation, adminSubmitter: 'Admin C', assignedSales: 'Charlie',
        callStatus: CallStatus.FollowUp, saleValue: 0, notes: 'Follow up after the holidays.', followUpDate: `${getCurrentYear() + 1}-01-10`, createdAt: new Date(Date.now() - 86400000 * 20)
    },
    {
        id: 'lead21',
        firstName: 'Daniel', lastName: 'Harris', phone: '0977777777', birthDate: '1994-03-14',
        address: '888 Juniper Way, Satun', program: Program.General, adminSubmitter: 'Admin A', assignedSales: 'Diana',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: '', followUpDate: null, createdAt: new Date(Date.now() - 3600000 * 2)
    },
    {
        id: 'lead22',
        firstName: 'Betty', lastName: 'Martin', phone: '0988888888', birthDate: '1981-12-01',
        address: '999 Laurel Rd, Yala', program: Program.FixFaceLock, adminSubmitter: 'Admin B', assignedSales: 'Ethan',
        callStatus: CallStatus.Appointment, saleValue: 0, notes: 'Appointment confirmed.', followUpDate: null, createdAt: new Date(Date.now() - 86400000 * 7)
    },
    {
        id: 'lead23',
        firstName: 'Paul', lastName: 'Thompson', phone: '0999999999', birthDate: '1997-06-24',
        address: '121 Palm St, Pattani', program: Program.Premium, adminSubmitter: 'Admin C', assignedSales: 'Alice',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: '', followUpDate: null, createdAt: new Date(Date.now() - 60000)
    },
     {
        id: 'lead24',
        firstName: 'Steven', lastName: 'Lee', phone: '0812345001', birthDate: '1986-10-03',
        address: '232 Pine St, Narathiwat', program: Program.General, adminSubmitter: 'Admin A', assignedSales: 'Bob',
        callStatus: CallStatus.Uncalled, saleValue: 0, notes: '', followUpDate: null, createdAt: new Date(Date.now() - 120000)
    },
    {
        id: 'lead25',
        firstName: 'Sandra', lastName: 'Perez', phone: '0812345002', birthDate: '1992-04-09',
        address: '343 Oak St, Bangkok', program: Program.Consultation, adminSubmitter: 'Admin B', assignedSales: 'Diana',
        callStatus: CallStatus.Contacted, saleValue: 0, notes: 'Considering options.', followUpDate: null, createdAt: new Date(Date.now() - 86400000 * 5)
    }
];
