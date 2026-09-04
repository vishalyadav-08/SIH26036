import { api } from "@/lib/api";
import { User } from "@/types/auth";
import { Paginated } from "@/types/instrument";
import { Officer } from "@/types/officer";

/**
 * Officer directory for the admin assignment screen.
 *
 * There is no dedicated officers endpoint yet — OPS-001 owns workload counts —
 * so this reads the user directory filtered by role (both field-staff roles,
 * LMO and GATC, are assignable) and maps it onto the shape the screen
 * renders. Caseload fields are reported as 0 rather than invented; they
 * become real when OPS-001 lands.
 */
export const officersService = {
  async list(): Promise<Paginated<User>> {
    const { data } = await api.get<Paginated<User>>("/users/", {
      params: { role: "LMO,GATC" },
    });

    return data;
  },
};

function toOfficer(user: User): Officer {
  return {
    id: user.id,
    userId: user.id,
    name: user.displayName,
    email: user.email,
    badgeNumber: "—",
    jurisdiction: "DEMO",
    activeCaseload: 0,
    maxCaseload: 0,
    status: user.active ? "ACTIVE" : "INACTIVE",
    phone: user.phone ?? "",
  };
}

export async function getOfficers(): Promise<Officer[]> {
  return (await officersService.list()).items.map(toOfficer);
}

export default officersService;
