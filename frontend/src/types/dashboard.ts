export interface ApplicationStateCounts {
  submitted: number;
  assigned: number;
  scheduled: number;
  inspected: number;
  completed: number;
  total: number;
}

export interface CertificateStatusCounts {
  valid: number;
  expired: number;
  revoked: number;
  total: number;
}

export interface AdminDashboardData {
  applicationCounts: ApplicationStateCounts;
  certificateCounts: CertificateStatusCounts;
  activeOfficersCount: number;
  totalInstrumentsCount: number;
  pendingTriageCount: number;
  scheduledTodayCount: number;
}
