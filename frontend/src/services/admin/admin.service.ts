import { USE_MOCK_API, api } from "@/lib/api";
import { AdminDashboardData } from "@/types/dashboard";
import { getApplications } from "@/services/applications/applications.service";
import { getCertificates } from "@/services/certificates/certificates.service";
import { getOfficers } from "@/services/officers/officers.service";
import { getInstruments } from "@/services/instruments/instruments.service";

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (USE_MOCK_API) {
    return mockGetAdminDashboardData();
  }

  // Real API call based on API_Contract.md
  // GET /api/v1/dashboards/admin
  // The contract response is mapped to the internal `AdminDashboardData` type.
  const response = await api.get<{
    applicationCountsByState: Record<string, number>;
    certificateCountsByStatus: Record<string, number>;
    officerWorkload?: unknown[]; // Allow optional length check
  }>("/dashboards/admin");
  // Assuming the UI expects specific fields, we map the response to fit our Dashboard Data UI shape.
  // The API returns applicationCountsByState, certificateCountsByStatus, etc.
  return {
    applicationCounts: {
      submitted: response.applicationCountsByState.SUBMITTED || 0,
      assigned: response.applicationCountsByState.ASSIGNED || 0,
      scheduled: response.applicationCountsByState.SCHEDULED || 0,
      inspected: response.applicationCountsByState.INSPECTED || 0,
      completed: response.applicationCountsByState.COMPLETED || 0,
      total: Object.values(response.applicationCountsByState as Record<string, number>).reduce((a,b) => a+b, 0)
    },
    certificateCounts: {
      valid: response.certificateCountsByStatus.VALID || 0,
      expired: response.certificateCountsByStatus.EXPIRED || 0,
      revoked: response.certificateCountsByStatus.REVOKED || 0,
      total: Object.values(response.certificateCountsByStatus as Record<string, number>).reduce((a,b) => a+b, 0)
    },
    activeOfficersCount: response.officerWorkload?.length || 0,
    totalInstrumentsCount: 0, // Not explicitly in the dashboard contract, maybe mock only or zeroed out
    pendingTriageCount: response.applicationCountsByState.SUBMITTED || 0,
    scheduledTodayCount: response.applicationCountsByState.SCHEDULED || 0,
  };
}

// ----------------------------------------------------------------------------
// MOCK IMPLEMENTATION
// ----------------------------------------------------------------------------

async function mockGetAdminDashboardData(): Promise<AdminDashboardData> {
  const [apps, certs, officers, instruments] = await Promise.all([
    getApplications(),
    getCertificates(),
    getOfficers(),
    getInstruments(),
  ]);

  const appCounts = {
    submitted: apps.filter((a) => a.state === "SUBMITTED").length,
    assigned: apps.filter((a) => a.state === "ASSIGNED").length,
    scheduled: apps.filter((a) => a.state === "SCHEDULED").length,
    inspected: apps.filter((a) => a.state === "INSPECTED").length,
    completed: apps.filter((a) => a.state === "COMPLETED").length,
    total: apps.length,
  };

  const certCounts = {
    valid: certs.filter((c) => c.status === "VALID").length,
    expired: certs.filter((c) => c.status === "EXPIRED").length,
    revoked: certs.filter((c) => c.status === "REVOKED").length,
    total: certs.length,
  };

  return {
    applicationCounts: appCounts,
    certificateCounts: certCounts,
    activeOfficersCount: officers.filter((o) => o.status === "ACTIVE").length,
    totalInstrumentsCount: instruments.length,
    pendingTriageCount: appCounts.submitted,
    scheduledTodayCount: appCounts.scheduled,
  };
}
