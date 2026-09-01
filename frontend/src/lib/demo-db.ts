import { Application } from "@/types/application";
import { Certificate, PublicVerificationResponse } from "@/types/certificate";
import { InspectionDraft } from "@/types/inspection";
import { Instrument } from "@/types/instrument";

export const DEMO_STORAGE_KEY = "mapansetu_demo_db";

export interface DemoDatabaseState {
  applications: Application[];
  certificates: Certificate[];
  inspections: InspectionDraft[];
  instruments: Instrument[];
}

const FUTURE_DATE = new Date();
FUTURE_DATE.setFullYear(FUTURE_DATE.getFullYear() + 1);

const PAST_DATE = new Date();
PAST_DATE.setFullYear(PAST_DATE.getFullYear() - 1);

const INITIAL_STATE: DemoDatabaseState = {
  instruments: [
    {
      id: "ins-uuid-001",
      instrumentNumber: "INS-DEMO-001",
      serialNumber: "SN-DEMO-001",
      instrumentType: "ELECTRONIC_SCALE",
      manufacturer: "MapanSetu Demo Instruments",
      model: "MS-100",
      capacity: 100,
      capacityUnit: "kg",
      location: "Demo Market, Gorakhpur",
      status: "ACTIVE",
      businessId: "biz-demo-001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  applications: [
    {
      id: "app-uuid-001",
      applicationNumber: "APP-DEMO-001",
      instrumentId: "ins-uuid-001",
      instrumentNumber: "INS-DEMO-001",
      instrumentType: "ELECTRONIC_SCALE",
      businessId: "biz-demo-001",
      businessName: "Demo Business Owner",
      state: "SUBMITTED",
      reason: "Periodic verification",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  inspections: [],
  certificates: [
    {
      id: "cert-uuid-001",
      certificateNumber: "CERT-DEMO-001",
      applicationId: "app-uuid-001",
      applicationNumber: "APP-DEMO-001",
      instrumentId: "ins-uuid-001",
      instrumentNumber: "INS-DEMO-001",
      instrumentType: "ELECTRONIC_SCALE",
      businessId: "biz-demo-001",
      businessName: "Demo Business Owner",
      status: "VALID",
      issuedAt: new Date().toISOString(),
      validUntil: FUTURE_DATE.toISOString(),
      payloadHash: "hash-demo-12345",
      signatureAlgorithm: "RS256",
      qrVerificationUrl: "/verify/CERT-DEMO-001",
      issuerOfficerName: "Inspector Sharma (LMO)",
    },
    {
      id: "cert-uuid-expired",
      certificateNumber: "CERT-DEMO-EXPIRED",
      applicationId: "app-uuid-expired",
      applicationNumber: "APP-DEMO-EXPIRED",
      instrumentId: "ins-uuid-expired",
      instrumentNumber: "INS-DEMO-EXPIRED",
      instrumentType: "ELECTRONIC_SCALE",
      businessId: "biz-demo-001",
      businessName: "Demo Business Owner",
      status: "EXPIRED",
      issuedAt: PAST_DATE.toISOString(),
      validUntil: PAST_DATE.toISOString(),
      payloadHash: "hash-demo-expired",
      signatureAlgorithm: "RS256",
      qrVerificationUrl: "/verify/CERT-DEMO-EXPIRED",
      issuerOfficerName: "Inspector Sharma (LMO)",
    },
    {
      id: "cert-uuid-revoked",
      certificateNumber: "CERT-DEMO-REVOKED",
      applicationId: "app-uuid-revoked",
      applicationNumber: "APP-DEMO-REVOKED",
      instrumentId: "ins-uuid-revoked",
      instrumentNumber: "INS-DEMO-REVOKED",
      instrumentType: "ELECTRONIC_SCALE",
      businessId: "biz-demo-001",
      businessName: "Demo Business Owner",
      status: "REVOKED",
      revokedAt: new Date().toISOString(),
      revocationReason: "Tampering detected",
      issuedAt: PAST_DATE.toISOString(),
      validUntil: FUTURE_DATE.toISOString(),
      payloadHash: "hash-demo-revoked",
      signatureAlgorithm: "RS256",
      qrVerificationUrl: "/verify/CERT-DEMO-REVOKED",
      issuerOfficerName: "Inspector Sharma (LMO)",
    },
    {
      id: "cert-uuid-invalid",
      certificateNumber: "CERT-DEMO-INVALID",
      applicationId: "app-uuid-invalid",
      applicationNumber: "APP-DEMO-INVALID",
      instrumentId: "ins-uuid-invalid",
      instrumentNumber: "INS-DEMO-INVALID",
      instrumentType: "ELECTRONIC_SCALE",
      businessId: "biz-demo-001",
      businessName: "Demo Business Owner",
      status: "INVALID",
      issuedAt: PAST_DATE.toISOString(),
      validUntil: FUTURE_DATE.toISOString(),
      payloadHash: "hash-demo-invalid",
      signatureAlgorithm: "RS256",
      qrVerificationUrl: "/verify/CERT-DEMO-INVALID",
      issuerOfficerName: "Inspector Sharma (LMO)",
    },
  ],
};

export class DemoRepository {
  private static getState(): DemoDatabaseState {
    if (typeof window === "undefined") return INITIAL_STATE;
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) {
      this.reset();
      return INITIAL_STATE;
    }
    try {
      return JSON.parse(raw) as DemoDatabaseState;
    } catch {
      return INITIAL_STATE;
    }
  }

  private static saveState(state: DemoDatabaseState) {
    if (typeof window !== "undefined") {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    }
  }

  static reset() {
    if (typeof window !== "undefined") {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(INITIAL_STATE));
    }
  }

  // --- Applications ---
  static getApplications(): Application[] {
    return this.getState().applications;
  }

  static getApplicationById(id: string): Application | null {
    const apps = this.getApplications();
    return apps.find((a) => a.id === id || a.applicationNumber === id) || null;
  }

  static createApplication(data: { instrumentId: string; reason: string }): Application {
    const state = this.getState();
    const instrument = state.instruments.find((i) => i.id === data.instrumentId || i.instrumentNumber === data.instrumentId);
    
    const newApp: Application = {
      id: "app-uuid-" + Date.now(),
      applicationNumber: "APP-DEMO-" + String(state.applications.length + 1).padStart(3, "0"),
      instrumentId: data.instrumentId,
      instrumentNumber: instrument?.instrumentNumber || data.instrumentId,
      instrumentType: instrument?.instrumentType || "ELECTRONIC_SCALE",
      businessId: "biz-demo-001",
      businessName: "MapanSetu Demo Weighing Solutions",
      state: "SUBMITTED",
      reason: data.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    state.applications.unshift(newApp);
    this.saveState(state);
    return newApp;
  }

  static assignOfficer(applicationId: string, officerUserId: string, officerName: string): Application {
    const state = this.getState();
    const index = state.applications.findIndex(a => a.id === applicationId || a.applicationNumber === applicationId);
    if (index === -1) throw new Error("Not found");

    state.applications[index] = {
      ...state.applications[index],
      state: "ASSIGNED",
      assignedOfficerId: officerUserId,
      assignedOfficerName: officerName,
      updatedAt: new Date().toISOString()
    };
    this.saveState(state);
    return state.applications[index];
  }

  static scheduleInspection(applicationId: string, scheduledDate: string): Application {
    const state = this.getState();
    const index = state.applications.findIndex(a => a.id === applicationId || a.applicationNumber === applicationId);
    if (index === -1) throw new Error("Not found");

    state.applications[index] = {
      ...state.applications[index],
      state: "SCHEDULED",
      scheduledDate,
      updatedAt: new Date().toISOString()
    };
    this.saveState(state);
    return state.applications[index];
  }

  static startInspection(applicationId: string): Application {
    const state = this.getState();
    const index = state.applications.findIndex(a => a.id === applicationId || a.applicationNumber === applicationId);
    if (index === -1) throw new Error("Not found");
    
    state.applications[index] = {
      ...state.applications[index],
      state: "INSPECTED",
      updatedAt: new Date().toISOString()
    };
    this.saveState(state);
    return state.applications[index];
  }

  static completeInspection(applicationId: string, result: string): Application {
    const state = this.getState();
    const index = state.applications.findIndex(a => a.id === applicationId || a.applicationNumber === applicationId);
    if (index === -1) throw new Error("Not found");
    const app = state.applications[index];

    app.state = "COMPLETED";
    app.updatedAt = new Date().toISOString();

    if (result === "PASS") {
      const cert: Certificate = {
        id: "cert-uuid-" + Date.now(),
        certificateNumber: "CERT-DEMO-" + Date.now(),
        applicationId: app.id,
        applicationNumber: app.applicationNumber,
        instrumentId: app.instrumentId,
        instrumentNumber: app.instrumentNumber,
        instrumentType: app.instrumentType,
        businessId: app.businessId,
        businessName: app.businessName || "MapanSetu Demo Weighing Solutions",
        status: "VALID",
        issuedAt: new Date().toISOString(),
        validUntil: FUTURE_DATE.toISOString(),
        payloadHash: "hash-new-pass",
        signatureAlgorithm: "RS256",
        qrVerificationUrl: "/verify/CERT-DEMO-" + Date.now(),
        issuerOfficerName: app.assignedOfficerName || "Inspector Sharma (LMO)",
      };
      state.certificates.push(cert);
    }
    this.saveState(state);
    return app;
  }

  // --- Instruments ---
  static getInstruments(): Instrument[] {
    return this.getState().instruments;
  }

  static getInstrumentById(id: string): Instrument | null {
    const list = this.getInstruments();
    return list.find((ins) => ins.id === id || ins.instrumentNumber.toLowerCase() === id.toLowerCase()) || null;
  }

  static registerInstrument(data: import("@/types/instrument").RegisterInstrumentDto): Instrument {
    const state = this.getState();
    const newInstrument: Instrument = {
      id: "ins-uuid-" + Date.now(),
      instrumentNumber: data.instrumentNumber.trim().toUpperCase(),
      serialNumber: data.serialNumber?.trim() || undefined,
      instrumentType: data.instrumentType,
      manufacturer: data.manufacturer.trim(),
      model: data.model.trim(),
      capacity: Number(data.capacity),
      capacityUnit: data.capacityUnit || "kg",
      location: data.location?.trim() || "Registered Business Premises",
      status: "PENDING_VERIFICATION",
      businessId: "biz-demo-001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.instruments.unshift(newInstrument);
    this.saveState(state);
    return newInstrument;
  }

  // --- Certificates ---
  static getCertificates(): Certificate[] {
    return this.getState().certificates;
  }

  static verifyCertificate(certNo: string): PublicVerificationResponse {
    const state = this.getState();
    const cert = state.certificates.find((c) => c.certificateNumber === certNo);
    if (!cert) {
      throw new Error("Certificate not found");
    }

    return {
      certificateNumber: cert.certificateNumber,
      verificationStatus: cert.status,
      certificateStatus: cert.status,
      signatureValid: cert.status !== "INVALID",
      payloadHash: cert.payloadHash,
      signatureAlgorithm: cert.signatureAlgorithm,
      issuedAt: cert.issuedAt,
      validUntil: cert.validUntil,
      revokedAt: cert.revokedAt,
      revocationReason: cert.revocationReason,
      instrumentSummary: {
        instrumentNumber: cert.instrumentNumber,
        instrumentType: cert.instrumentType,
      },
      verificationMessage: cert.status === "VALID" ? "Certificate is valid" : "Certificate is " + cert.status.toLowerCase(),
    };
  }

  // --- Inspections ---
  static getInspections(): InspectionDraft[] {
    return this.getState().inspections;
  }
  
  static getInspection(appId: string): InspectionDraft | null {
    const state = this.getState();
    return state.inspections.find((i) => i.applicationId === appId) || null;
  }

  static saveInspection(draft: InspectionDraft): void {
    const state = this.getState();
    const index = state.inspections.findIndex(i => i.id === draft.id);
    if (index >= 0) {
      state.inspections[index] = draft;
    } else {
      state.inspections.push(draft);
    }
    this.saveState(state);
    
    // Auto-update application status if inspection is ready_to_sync with PASS result
    if (draft.status === "READY_TO_SYNC" && draft.result === "PASS") {
       const appIndex = state.applications.findIndex(a => a.id === draft.applicationId);
       if (appIndex !== -1 && state.applications[appIndex].state !== "COMPLETED") {
          this.completeInspection(draft.applicationId, "PASS");
       }
    }
  }
}
