import { Inspection } from '@/offline/types';

export const mockInspections: Inspection[] = [
  {
    id: "insp-001",
    applicationNumber: "APP-2026-8821",
    instrumentNumber: "INST-992",
    instrumentType: "Weighing Scale (Class III)",
    businessName: "City Supermarket",
    location: "Downtown Branch, Sector 4",
    scheduledAt: "2026-08-30T10:00:00Z",
    applicationState: "ASSIGNED",
    syncStatus: "SYNCED",
    lastSavedAt: "2026-08-29T08:00:00Z"
  },
  {
    id: "insp-002",
    applicationNumber: "APP-2026-8845",
    instrumentNumber: "INST-104",
    instrumentType: "Fuel Dispenser",
    businessName: "Highway Petro",
    location: "Route 66",
    scheduledAt: "2026-08-30T14:30:00Z",
    applicationState: "IN_PROGRESS",
    syncStatus: "LOCAL_DRAFT",
    lastSavedAt: "2026-08-29T14:15:00Z"
  },
  {
    id: "insp-003",
    applicationNumber: "APP-2026-8901",
    instrumentNumber: "INST-775",
    instrumentType: "Platform Scale",
    businessName: "Agri Traders",
    location: "Industrial Area Phase 1",
    scheduledAt: "2026-08-31T09:00:00Z",
    applicationState: "ASSIGNED",
    syncStatus: "READY_TO_SYNC",
    lastSavedAt: "2026-08-29T16:00:00Z"
  }
];

export const mockProfile = {
  name: "Officer Nitin",
  email: "nitin@mapansetu.gov.in",
  role: "Field Inspector",
  lastSync: "2026-08-29T18:00:00Z",
  pendingSyncCount: 1
};
