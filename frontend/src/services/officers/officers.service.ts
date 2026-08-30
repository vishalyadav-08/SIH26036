import { api } from "@/lib/api";
import { Officer } from "@/types/officer";

export const DEMO_OFFICERS: Officer[] = [
  {
    id: "off-001",
    userId: "usr-demo-off-001",
    name: "Inspector Sharma",
    email: "officer@example.test",
    badgeNumber: "LMO-DL-2024-0091",
    jurisdiction: "District Metrology Zone 1 (Central)",
    activeCaseload: 2,
    maxCaseload: 8,
    status: "ACTIVE",
    phone: "+91 98765 43210",
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: "off-002",
    userId: "usr-demo-off-002",
    name: "Inspector Verma",
    email: "verma.lmo@example.test",
    badgeNumber: "LMO-DL-2024-0042",
    jurisdiction: "District Metrology Zone 2 (North)",
    activeCaseload: 1,
    maxCaseload: 8,
    status: "ACTIVE",
    phone: "+91 98765 43211",
    lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "off-003",
    userId: "usr-demo-off-003",
    name: "Inspector Patel",
    email: "patel.lmo@example.test",
    badgeNumber: "LMO-DL-2024-0078",
    jurisdiction: "District Metrology Zone 3 (South)",
    activeCaseload: 0,
    maxCaseload: 8,
    status: "ACTIVE",
    phone: "+91 98765 43212",
    lastActiveAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export async function getOfficers(): Promise<Officer[]> {
  try {
    const res = await api.get<Officer[]>("/officers");
    return res.data;
  } catch {
    return DEMO_OFFICERS;
  }
}

export async function getOfficerById(id: string): Promise<Officer | null> {
  const officers = await getOfficers();
  return (
    officers.find((o) => o.id === id || o.userId === id) || null
  );
}
