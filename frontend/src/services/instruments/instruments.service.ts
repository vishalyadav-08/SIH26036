import { USE_MOCK_API, api } from "@/lib/api";
import { Instrument, RegisterInstrumentDto } from "@/types/instrument";

const INSTRUMENTS_STORAGE_KEY = "mapansetu_instruments_store";

export const INITIAL_DEMO_INSTRUMENTS: Instrument[] = [
  {
    id: "ins-uuid-001",
    instrumentNumber: "INS-DEMO-001",
    serialNumber: "SN-SML-500-8891",
    instrumentType: "ELECTRONIC_SCALE",
    manufacturer: "Synthetic Metrology Labs",
    model: "SML-Series 500",
    capacity: 100,
    capacityUnit: "kg",
    location: "Main Warehouse, Bay 3",
    status: "ACTIVE",
    businessId: "biz-demo-001",
    lastVerifiedAt: "2026-08-15T09:30:00Z",
    nextVerificationDue: "2027-08-15T23:59:59Z",
    activeCertificateNo: "CERT-DEMO-001",
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-15T09:30:00Z",
  },
  {
    id: "ins-uuid-002",
    instrumentNumber: "INS-DEMO-002",
    serialNumber: "SN-PSC-1000-4421",
    instrumentType: "PLATFORM_SCALE",
    manufacturer: "Synthetic Standard Corp",
    model: "PSC-Industrial 1000",
    capacity: 500,
    capacityUnit: "kg",
    location: "Dispatch Area, Gate 1",
    status: "PENDING_VERIFICATION",
    businessId: "biz-demo-001",
    lastVerifiedAt: "2025-08-15T09:30:00Z",
    nextVerificationDue: "2026-08-15T23:59:59Z",
    activeCertificateNo: "CERT-EXPIRED-001",
    createdAt: "2025-08-01T10:00:00Z",
    updatedAt: "2025-08-15T09:30:00Z",
  },
  {
    id: "ins-uuid-003",
    instrumentNumber: "INS-DEMO-003",
    serialNumber: "SN-PWS-25-1099",
    instrumentType: "COUNTER_SCALE",
    manufacturer: "Precision Weights Synthetic",
    model: "PWS-Retail 25",
    capacity: 25,
    capacityUnit: "kg",
    location: "Counter 2, Retail Shop",
    status: "ACTIVE",
    businessId: "biz-demo-001",
    lastVerifiedAt: "2026-01-10T10:00:00Z",
    nextVerificationDue: "2027-01-10T23:59:59Z",
    createdAt: "2026-01-05T09:00:00Z",
    updatedAt: "2026-01-10T10:00:00Z",
  },
];

function getStoredInstruments(): Instrument[] {
  if (typeof window === "undefined") return INITIAL_DEMO_INSTRUMENTS;
  const raw = localStorage.getItem(INSTRUMENTS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(
      INSTRUMENTS_STORAGE_KEY,
      JSON.stringify(INITIAL_DEMO_INSTRUMENTS)
    );
    return INITIAL_DEMO_INSTRUMENTS;
  }
  try {
    return JSON.parse(raw) as Instrument[];
  } catch {
    return INITIAL_DEMO_INSTRUMENTS;
  }
}

function saveStoredInstruments(instruments: Instrument[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INSTRUMENTS_STORAGE_KEY, JSON.stringify(instruments));
}

// ----------------------------------------------------------------------------
// PRIMARY EXPORTS (Switching logic)
// ----------------------------------------------------------------------------

export async function getInstruments(): Promise<Instrument[]> {
  if (USE_MOCK_API) return getStoredInstruments();

  const res = await api.get<{ items: Instrument[] }>("/instruments");
  return res.items || res as unknown as Instrument[];
}

export async function getInstrumentById(id: string): Promise<Instrument | null> {
  if (USE_MOCK_API) {
    const list = getStoredInstruments();
    return list.find(
      (ins) => ins.id === id || ins.instrumentNumber.toLowerCase() === id.toLowerCase()
    ) || null;
  }

  try {
    const res = await api.get<Instrument>(`/instruments/${id}`);
    return res as unknown as Instrument;
  } catch {
    return null;
  }
}

export async function registerInstrument(
  data: RegisterInstrumentDto
): Promise<Instrument> {
  if (USE_MOCK_API) {
    const instruments = getStoredInstruments();
    const newInstrument: Instrument = {
      id: `ins-uuid-${Date.now()}`,
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
    instruments.unshift(newInstrument);
    saveStoredInstruments(instruments);
    return newInstrument;
  }

  const res = await api.post<Instrument>("/instruments", data);
  return res as unknown as Instrument;
}
