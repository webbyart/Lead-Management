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
  id: string; // uuid
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string | null;
  address: string;
  program: Program;
  admin_submitter: string;
  assigned_sales_id: string | null; // uuid
  assigned_sales_name: string;
  call_status: CallStatus;
  sale_value: number;
  notes: string;
  follow_up_date: string | null;
  appointment_date?: string | null;
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

export interface SalesPerson {
  id: string; // uuid, references auth.users
  name: string;
  status: 'online' | 'offline';
  line_user_id: string | null;
  email: string;
  created_at: string; // ISO string
}

export interface Appointment {
  id: string; // uuid
  customer_name: string;
  appointment_date: string; // ISO string
  follow_up_type: string;
  assigned_to: string; 
  lead_id: string; // uuid
  created_at: string; // ISO string
}

export type User = {
  id: string;
  type: 'admin' | 'sales';
  name: string;
  email: string;
  details?: SalesPerson; // For sales user
}
