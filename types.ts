export enum UserRole {
  Admin = 'admin',
  Sales = 'sales',
  AfterCare = 'after_care',
  Calendar = 'calendar',
  System = 'system',
}

export enum Program {
  General = 'General Program',
  Premium = 'Premium Package',
  FixFaceLock = 'Fix Face Lock',
  Consultation = 'Consultation',
}

export enum CallStatus {
  Uncalled = 'ยังไม่ได้โทร',
  Contacted = 'ติดต่อแล้ว',
  FollowUp = 'ต้องติดตาม',
  Appointment = 'นัดหมายสำเร็จ',
  Quotation = 'เสนอราคา',
  Negotiation = 'ต่อรองราคา',
  ClosedWon = 'ปิดการขาย',
  ClosedLost = 'ปิดเคส (ไม่สนใจ)',
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string | null;
  address: string;
  program: Program;
  adminSubmitter: string;
  assignedSales: string;
  callStatus: CallStatus;
  saleValue: number;
  notes: string;
  followUpDate: string | null;
  appointmentDate?: string | null;
  createdAt: Date;
}

export interface SalesPerson {
  id: string;
  name: string;
  status: 'online' | 'offline';
  lineUserId: string;
  email: string;
  password?: string; // Should be handled securely in a real app
}

export interface Appointment {
  id:string;
  customerName: string;
  appointmentDate: Date;
  followUpType: string; // e.g., '+1 day', '+1 month'
  assignedTo: string; // Sales name or 'After Care'
}

export type User = {
  type: 'admin' | 'sales';
  name: string;
  details?: SalesPerson; // For sales user
}