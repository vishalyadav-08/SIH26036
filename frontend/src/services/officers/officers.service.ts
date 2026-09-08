import { USE_MOCK_API, api } from "@/lib/api";
import { Officer } from "@/types/officer";

export const DEMO_OFFICERS: Officer[] = [
  {
    id: "off-001",
    userId: "usr-demo-off-001",
    name: "Vinod Sharma (LMO)",
    email: "vinod.sharma@lmo.up.gov.demo",
    badgeNumber: "LMO-UP-2026-0091",
    jurisdiction: "Gorakhpur District Zone 1",
    activeCaseload: 2,
    maxCaseload: 8,
    status: "ACTIVE",
    phone: "+91 98765 43210",
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: "off-002",
    userId: "usr-demo-off-002",
    name: "Demo Test Centre (GATC)",
    email: "gatc@up.gov.demo",
    badgeNumber: "GATC-UP-2026-0042",
    jurisdiction: "Gorakhpur District Test Centre",
    activeCaseload: 1,
    maxCaseload: 12,
    status: "ACTIVE",
    phone: "+91 98765 43211",
    lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export async function getOfficers(): Promise<Officer[]> {
  if (USE_MOCK_API) return DEMO_OFFICERS;
  
  try {
    const res = await api.get<{ items: any[] }>("/users?role=LMO");
    const users = res.items || [];
    if (users.length === 0) return DEMO_OFFICERS;
    return users.map((u: any, idx: number) => ({
      id: u.id,
      userId: u.id,
      name: u.displayName || u.email,
      email: u.email,
      badgeNumber: `LMO-UP-${1000 + idx}`,
      jurisdiction: "Gorakhpur District",
      activeCaseload: 1,
      maxCaseload: 8,
      status: u.active ? "ACTIVE" : "INACTIVE",
      phone: u.phone || "+91 98765 43210",
      lastActiveAt: new Date().toISOString(),
    }));
  } catch {
    return DEMO_OFFICERS;
  }
}

export async function getOfficerById(id: string): Promise<Officer | null> {
  if (USE_MOCK_API) {
    return DEMO_OFFICERS.find((o) => o.id === id || o.userId === id) || null;
  }
  
  try {
    const list = await getOfficers();
    return list.find((o) => o.id === id || o.userId === id) || null;
  } catch {
    return null;
  }
}
