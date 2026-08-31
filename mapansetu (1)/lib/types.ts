export type UserRole = 'public' | 'merchant' | 'officer';

export type InstrumentStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'REJECTED';

export type ApplicationState = 'SUBMITTED' | 'ASSIGNED' | 'IN PROGRESS' | 'SCHEDULED' | 'APPROVED' | 'REJECTED' | 'DRAFT';

export interface Instrument {
  id: string;
  serialNumber: string;
  type: string;
  manufacturer: string;
  modelNumber: string;
  accuracyClass: string;
  capacity: string;
  resolution: string;
  location: string;
  status: InstrumentStatus;
  nextDue: string;
  registeredDate: string;
  imageUrl?: string;
  qrCode?: string;
  merchantName?: string;
  merchantAddress?: string;
  lastInspectionDate?: string;
  inspectorName?: string;
  certificateId?: string;
  lifecycle: {
    title: string;
    date: string;
    description: string;
    type: 'registered' | 'application' | 'inspection' | 'certificate';
    reportLink?: boolean;
    pdfDownload?: boolean;
    validUntil?: string;
  }[];
}

export interface VerificationApplication {
  id: string;
  businessName: string;
  instrumentId: string;
  instrumentType: string;
  state: ApplicationState;
  officer?: string;
  officerRole?: string;
  submittedDate: string;
  scheduledDate?: string;
  feePaid: number;
  location: string;
  remarks?: string;
}

export interface VerificationCertificate {
  certificateNumber: string;
  instrumentId: string;
  instrumentType: string;
  manufacturer: string;
  serialNumber: string;
  issuedDate: string;
  validUntil: string;
  status: 'VALID' | 'EXPIRED' | 'SUSPENDED';
  signatureVerified: boolean;
  payloadIntegrityVerified: boolean;
  sha256Hash: string;
  issuedByOfficer: string;
  issuedAtOffice: string;
  merchantName: string;
  merchantAddress: string;
  qrPayload: string;
}

export interface Officer {
  id: string;
  name: string;
  badgeNumber: string;
  designation: string;
  jurisdiction: string;
  assignedCount: number;
  status: 'Available' | 'On Field' | 'On Leave';
  contact: string;
}

export interface AuditLog {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  category: 'assignment' | 'settings' | 'audit' | 'verification' | 'system';
  severity: 'info' | 'warning' | 'success';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: 'warning' | 'info' | 'success';
  read: boolean;
}
