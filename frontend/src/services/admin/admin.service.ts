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
  const [response, instRes] = await Promise.all([
    api.get<{
      applicationCountsByState?: Record<string, number>;
      certificateCountsByStatus?: Record<string, number>;
      officerWorkload?: unknown[];
    }>("/dashboards/admin"),
    api
      .get<{ totalItems?: number; items?: unknown[] }>("/instruments")
      .catch(() => ({ totalItems: 0, items: [] as unknown[] })),
  ]);

  const appCounts = response?.applicationCountsByState || {};
  const certCounts = response?.certificateCountsByStatus || {};
  const officerWorkload = response?.officerWorkload || [];
  const instRecord = instRes as { totalItems?: number; items?: unknown[] } | undefined;
  const totalInsts =
    typeof instRecord?.totalItems === "number"
      ? instRecord.totalItems
      : Array.isArray(instRecord?.items)
      ? instRecord.items.length
      : 0;

  return {
    applicationCounts: {
      submitted: appCounts.SUBMITTED || 0,
      assigned: appCounts.ASSIGNED || 0,
      scheduled: appCounts.SCHEDULED || 0,
      inspected: appCounts.INSPECTED || 0,
      completed: appCounts.COMPLETED || 0,
      total: Object.values(appCounts).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0),
    },
    certificateCounts: {
      valid: certCounts.ACTIVE || certCounts.VALID || 0,
      expired: certCounts.EXPIRED || 0,
      revoked: certCounts.REVOKED || 0,
      total: Object.values(certCounts).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0),
    },
    activeOfficersCount: officerWorkload.length,
    totalInstrumentsCount: totalInsts,
    pendingTriageCount: appCounts.SUBMITTED || 0,
    scheduledTodayCount: appCounts.SCHEDULED || 0,
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
