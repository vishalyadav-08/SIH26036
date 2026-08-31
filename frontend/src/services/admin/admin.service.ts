import { getApplications } from "@/services/applications/applications.service";
import { getCertificates } from "@/services/certificates/certificates.service";
import { getOfficers } from "@/services/officers/officers.service";
import { getInstruments } from "@/services/instruments/instruments.service";
import { AdminDashboardData } from "@/types/dashboard";

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
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
    inspected: apps.filter((a) => a.state === "INSPECTION_IN_PROGRESS").length,
    completed: apps.filter((a) => a.state === "COMPLETED").length,
    total: apps.length,
  };

  const certCounts = {
    valid: certs.filter((c) => c.status === "ACTIVE").length,
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
