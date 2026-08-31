import { api } from "@/lib/api";
import { Application, CreateApplicationDto } from "@/types/application";
import { saveCachedApplication } from "@/lib/offline-storage";

const APPLICATIONS_STORAGE_KEY = "mapansetu_applications_store";

export const INITIAL_DEMO_APPLICATIONS: Application[] = [
  {
    id: "app-uuid-001",
    applicationNumber: "APP-2026-0001",
    instrumentId: "ins-uuid-001",
    instrumentNumber: "INS-DEMO-001",
    instrumentType: "ELECTRONIC_SCALE",
    businessId: "biz-demo-001",
    businessName: "Demo Business Owner",
    state: "COMPLETED",
    reason: "Initial verification of newly acquired electronic scale.",
    assignedOfficerId: "usr-demo-off-001",
    assignedOfficerName: "Inspector Sharma (LMO)",
    certificateId: "cert-uuid-001",
    certificateNumber: "CERT-DEMO-001",
    createdAt: "2026-08-10T11:00:00Z",
    updatedAt: "2026-08-15T09:30:00Z",
  },
  {
    id: "app-uuid-002",
    applicationNumber: "APP-2026-0002",
    instrumentId: "ins-uuid-002",
    instrumentNumber: "INS-DEMO-002",
    instrumentType: "PLATFORM_SCALE",
    businessId: "biz-demo-001",
    businessName: "Demo Business Owner",
    state: "SUBMITTED",
    reason: "Re-verification following certificate expiry.",
    createdAt: "2026-08-28T14:20:00Z",
    updatedAt: "2026-08-28T14:20:00Z",
  },
  {
    id: "app-uuid-003",
    applicationNumber: "APP-2026-0003",
    instrumentId: "ins-uuid-003",
    instrumentNumber: "INS-DEMO-003",
    instrumentType: "COUNTER_SCALE",
    businessId: "biz-demo-001",
    businessName: "Demo Business Owner",
    state: "SCHEDULED",
    reason: "Periodic annual statutory verification.",
    assignedOfficerId: "usr-demo-off-001",
    assignedOfficerName: "Inspector Sharma (LMO)",
    scheduledDate: "2026-09-05T10:00:00Z",
    createdAt: "2026-08-20T09:15:00Z",
    updatedAt: "2026-08-22T16:00:00Z",
  },
];

function getStoredApplications(): Application[] {
  if (typeof window === "undefined") return INITIAL_DEMO_APPLICATIONS;
  const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(
      APPLICATIONS_STORAGE_KEY,
      JSON.stringify(INITIAL_DEMO_APPLICATIONS)
    );
    return INITIAL_DEMO_APPLICATIONS;
  }
  try {
    return JSON.parse(raw) as Application[];
  } catch {
    return INITIAL_DEMO_APPLICATIONS;
  }
}

function saveStoredApplications(apps: Application[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(apps));
}

export async function getApplications(): Promise<Application[]> {
  try {
    const res = await api.get<Application[]>("/applications");
    return res.data;
  } catch {
    return getStoredApplications();
  }
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const apps = await getApplications();
  const found = apps.find(
    (app) => app.id === id || app.applicationNumber.toLowerCase() === id.toLowerCase()
  );
  return found || null;
}

export async function createApplication(
  data: CreateApplicationDto
): Promise<Application> {
  try {
    const res = await api.post<Application>("/applications", data);
    return res.data;
  } catch {
    const apps = getStoredApplications();
    let instrumentNum = data.instrumentId;
    let instrumentType = "ELECTRONIC_SCALE";

    if (typeof window !== "undefined") {
      const rawIns = localStorage.getItem("mapansetu_instruments_store");
      if (rawIns) {
        try {
          const list = JSON.parse(rawIns);
          const found = list.find(
            (i: { id: string; instrumentNumber: string; instrumentType: string }) =>
              i.id === data.instrumentId ||
              i.instrumentNumber.toLowerCase() === data.instrumentId.toLowerCase()
          );
          if (found) {
            instrumentNum = found.instrumentNumber;
            instrumentType = found.instrumentType;
          }
        } catch {
          // ignore
        }
      }
    }

    const newApp: Application = {
      id: `app-uuid-${Date.now()}`,
      applicationNumber: `APP-2026-${String(apps.length + 1).padStart(4, "0")}`,
      instrumentId: data.instrumentId,
      instrumentNumber: instrumentNum,
      instrumentType: instrumentType,
      businessId: "biz-demo-001",
      businessName: "Demo Business Owner",
      state: "SUBMITTED",
      reason: data.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    apps.unshift(newApp);
    saveStoredApplications(apps);
    return newApp;
  }
}

export async function assignOfficerToApplication(
  applicationId: string,
  officerUserId: string,
  officerName: string,
  note?: string
): Promise<Application> {
  try {
    const res = await api.post<Application>(`/applications/${applicationId}/assign`, {
      officerUserId,
      assignmentNote: note || "Assigned by Admin Supervisor",
    });
    return res.data;
  } catch {
    const apps = getStoredApplications();
    const index = apps.findIndex(
      (a) => a.id === applicationId || a.applicationNumber.toLowerCase() === applicationId.toLowerCase()
    );
    if (index >= 0) {
      apps[index].state = "ASSIGNED";
      apps[index].assignedOfficerId = officerUserId;
      apps[index].assignedOfficerName = officerName;
      apps[index].updatedAt = new Date().toISOString();
      saveStoredApplications(apps);
      // Also cache in offline storage for the field officer!
      saveCachedApplication(apps[index]);
      return apps[index];
    }
    throw new Error("Application not found");
  }
}

export async function scheduleApplicationVisit(
  applicationId: string,
  scheduledAt: string,
  note?: string
): Promise<Application> {
  try {
    const res = await api.post<Application>(`/applications/${applicationId}/schedule`, {
      scheduledAt,
      scheduleNote: note || "Scheduled appointment",
    });
    return res.data;
  } catch {
    const apps = getStoredApplications();
    const index = apps.findIndex(
      (a) => a.id === applicationId || a.applicationNumber.toLowerCase() === applicationId.toLowerCase()
    );
    if (index >= 0) {
      apps[index].state = "SCHEDULED";
      apps[index].scheduledDate = scheduledAt;
      apps[index].updatedAt = new Date().toISOString();
      saveStoredApplications(apps);
      // Ensure cached for field officer
      saveCachedApplication(apps[index]);
      return apps[index];
    }
    throw new Error("Application not found");
  }
}
