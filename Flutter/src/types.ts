export type ScreenType =
  | 'splash'
  | 'login'
  | 'dashboard'
  | 'inspections'
  | 'inspection-flow'
  | 'location-capture'
  | 'sync'
  | 'conflict'
  | 'profile'
  | 'security-sessions'
  | 'map'
  | 'history'
  | 'templates';

export type InspectionStatus = 'scheduled' | 'draft' | 'ready_to_sync' | 'completed' | 'urgent';

export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  completed: boolean;
  notes?: string;
}

export interface MeasurementReading {
  id: string;
  name: string;
  referenceWeight: number; // in kg or unit
  indicatedWeight?: number; // in kg or unit
  maxPermissibleError: number; // in kg or unit, e.g. 0.050
  unit: string;
  isRequired: boolean;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  businessType: string;
  apparatusType: string;
  accuracyClass: 'Class I' | 'Class II' | 'Class III' | 'Class IIII';
  description: string;
  icon: string;
  color: string;
  checklists: ChecklistItem[];
  readings: MeasurementReading[];
  defaultNotes?: string;
  applicableLaw?: string;
  createdAt: string;
  isPredefined?: boolean;
  authorBadge?: string;
  usageCount?: number;
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: 'photo' | 'document';
  imageUrl: string;
  capturedAt: string;
  locationStatus: 'captured' | 'pending' | 'unavailable';
  fileSize: string;
  isLocalOnly: boolean;
  notes?: string;
}

export type InspectionResult = 'pass' | 'fail' | 'correction' | null;

export interface InspectionTask {
  id: string;
  appId: string; // e.g. APP-DEMO-001
  title: string; // e.g. Counter Scale
  businessName: string; // e.g. Demo Measurement Co.
  sector: string; // e.g. Sector 7G
  status: InspectionStatus;
  scheduledTime: string; // e.g. "Today 10:00 AM"
  description: string;
  urgency?: 'urgent' | 'routine' | 'scheduled';
  deviceModel?: string;
  serialNumber?: string;
  accuracyClass?: 'Class I' | 'Class II' | 'Class III' | 'Class IIII';
  certificateNo?: string;
  stampId?: string;
  completedDate?: string;
  checklists: ChecklistItem[];
  readings: MeasurementReading[];
  evidence: EvidenceItem[];
  location: {
    lat?: number;
    lng?: number;
    accuracy?: number;
    status: 'available' | 'unavailable' | 'denied' | 'acquiring';
    address?: string;
  };
  finalAssessment?: {
    result: InspectionResult;
    officerNotes: string;
    submittedAt?: string;
    officerSignature?: string;
    verifiedStampId?: string;
  };
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  deviceType: 'tablet' | 'handheld' | 'mobile' | 'desktop';
  ipAddress: string;
  appVersion: string;
  isCurrentDevice: boolean;
  lastActive: string;
  location: string;
}

export interface SyncQueueItem {
  id: string;
  appId: string;
  type: 'draft' | 'photo' | 'failed' | 'ready';
  title: string;
  status: 'pending' | 'queue' | 'failed' | 'synced';
  errorMsg?: string;
  timestamp?: string;
}

export interface OfficerProfile {
  id: string;
  name: string;
  role: string;
  badgeNumber: string;
  avatarUrl: string;
  lastSync: string;
  storageUsedMB: number;
  storageTotalMB: number;
  biometricEnabled: boolean;
  language: 'en' | 'hi';
}
