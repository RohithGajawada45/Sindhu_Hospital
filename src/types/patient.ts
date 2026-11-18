export type Language = 'en' | 'te' | 'hi';

export type TabId = 'home' | 'care' | 'records' | 'billing' | 'profile';

export type ReportStatus = 'Normal' | 'Review';

export type RecordCategory = 'lab' | 'imaging' | 'discharge' | 'prescriptions';

export type BillStatus = 'Paid' | 'Due';

export type BillingTab = 'bills' | 'receipts' | 'deposits';

export interface FamilyMember {
  id: string;
  name: string;
  fullName: string;
  relation: 'Self' | 'Mother' | 'Father' | 'Spouse' | 'Child';
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  uhid: string;
  dob: string;
  bloodGroup?: string;
  insuranceProvider?: string;
  phone: string;
  email?: string;
  address: {
    line1: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  speciality: string;
  qualification: string;
  experienceYears: number;
  facilityId: string;
  facilityName: string;
  nextSlotLabel: string;
  fee: number;
  photoUrl: string;
  languages: string[];
}

export interface Facility {
  id: string;
  name: string;
  area: string;
  address: string;
}

export interface Appointment {
  id: string;
  memberId: string;
  doctorId: string;
  doctorName: string;
  doctorPhoto: string;
  speciality: string;
  facilityName: string;
  dateIso: string; // YYYY-MM-DD
  dateLabel: string; // e.g. "Thu, 20 Nov 2026"
  timeSlot: string; // e.g. "10:30 AM"
  status: 'upcoming' | 'past' | 'cancelled';
  checkedIn: boolean;
  tokenNumber?: string;
  bayLocation?: string;
  fee: number;
  notes?: string;
}

export interface TrendPoint {
  dateLabel: string;
  value: number;
}

export interface LabReport {
  id: string;
  memberId: string;
  testName: string;
  category: 'lab';
  dateIso: string;
  dateDisplay: string;
  timeDisplay: string;
  status: ReportStatus;
  keyValue: number;
  unit: string;
  keyMetricLabel: string;
  referenceMin: number;
  referenceMax: number;
  referenceRangeText: string;
  plainExplanation: string;
  doctorName: string;
  trend: TrendPoint[];
  subResults?: {
    label: string;
    value: string;
    range: string;
    status: ReportStatus;
  }[];
}

export interface ImagingReport {
  id: string;
  memberId: string;
  testName: string;
  modality: string;
  dateIso: string;
  dateDisplay: string;
  status: ReportStatus;
  summary: string;
  doctorName: string;
  findings: string;
}

export interface DischargeSummary {
  id: string;
  memberId: string;
  title: string;
  department: string;
  dateIso: string;
  dateDisplay: string;
  doctorName: string;
  stayDuration: string;
  summary: string;
  followUpDate: string;
}

export interface PrescriptionItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;
}

export interface Prescription {
  id: string;
  memberId: string;
  doctorName: string;
  speciality: string;
  dateIso: string;
  dateDisplay: string;
  diagnosisNote: string;
  medications: PrescriptionItem[];
}

export interface BillLineItem {
  description: string;
  qty: number;
  amount: number;
}

export interface Bill {
  id: string;
  memberId: string;
  title: string;
  category: 'OP' | 'Lab' | 'Pharmacy' | 'Daycare';
  dateIso: string;
  dateDisplay: string;
  monthKey: string; // e.g. '2026-11'
  amount: number;
  status: BillStatus;
  doctorName: string;
  items: BillLineItem[];
}

export interface Receipt {
  id: string;
  memberId: string;
  title: string;
  dateIso: string;
  dateDisplay: string;
  monthKey: string;
  amount: number;
  method: string;
  referenceNo: string;
}

export interface DepositEntry {
  id: string;
  memberId: string;
  type: 'OP Deposit' | 'IP Deposit' | 'Refund';
  dateIso: string;
  dateDisplay: string;
  monthKey: string;
  amount: number;
  note: string;
}

export interface WalletSummary {
  available: number;
  used: number;
  refunded: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  category: 'report' | 'appointment' | 'billing' | 'prescription';
  read: boolean;
  targetTab: TabId;
  targetId?: string;
}
