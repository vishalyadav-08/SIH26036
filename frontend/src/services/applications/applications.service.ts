import { api } from "@/lib/api";
import { Application, ApplicationState } from "@/types/application";
import { Paginated } from "@/types/instrument";

export type { Application, ApplicationState };

export interface Assignment {
  id: string;
  officerUserId: string;
  officerName: string;
  assignedAt: string;
  unassignedAt: string | null;
  assignmentNote: string;
}


export const applicationsService = {
  async list(params: { state?: string; instrumentId?: string; page?: number } = {}) {
    const { data } = await api.get<Paginated<Application>>("/applications/", { params });

    return data;
  },

  async get(id: string): Promise<Application> {
    const { data } = await api.get<Application>(`/applications/${id}/`);

    return data;
  },

  async create(payload: { instrumentId: string; reason?: string; submit?: boolean }) {
    const { data } = await api.post<Application>("/applications/", payload);

    return data;
  },

  async submit(id: string) {
    const { data } = await api.post<Application>(`/applications/${id}/submit/`);

    return data;
  },

  async assign(id: string, officerUserId: string, assignmentNote = "") {
    const { data } = await api.post<Application>(`/applications/${id}/assign/`, {
      officerUserId,
      assignmentNote,
    });

    return data;
  },

  async schedule(id: string, scheduledAt: string, scheduleNote = "") {
    const { data } = await api.post<Application>(`/applications/${id}/schedule/`, {
      scheduledAt,
      scheduleNote,
    });

    return data;
  },

  async reject(id: string, reason: string) {
    const { data } = await api.post<Application>(`/applications/${id}/reject/`, { reason });

    return data;
  },

  async cancel(id: string, reason: string) {
    const { data } = await api.post<Application>(`/applications/${id}/cancel/`, { reason });

    return data;
  },
};

export default applicationsService;

/* ---------------------------------------------------------------------------
 * Named exports kept for the existing pages.
 *
 * The API returns the paginated envelope {items, page, ...}; these unwrap it to
 * the plain array the screens were written against, so the integration did not
 * require rewriting every page.
 * ------------------------------------------------------------------------- */

export async function getApplications(params: { state?: string } = {}) {
  return (await applicationsService.list(params)).items;
}

export async function getApplicationById(id: string) {
  return applicationsService.get(id);
}

export async function createApplication(payload: {
  instrumentId: string;
  reason?: string;
  submit?: boolean;
}) {
  return applicationsService.create(payload);
}

/**
 * `officerName` is accepted and ignored: the screen passes it for its own
 * confirmation message, but the server resolves the officer from the id. It is
 * not something the client gets to assert.
 */
export async function assignOfficerToApplication(
  id: string,
  officerUserId: string,
  _officerName?: string,
  assignmentNote = ""
) {
  return applicationsService.assign(id, officerUserId, assignmentNote);
}

export async function scheduleApplicationVisit(
  id: string,
  scheduledAt: string,
  note?: string
) {
  return applicationsService.schedule(id, scheduledAt, note ?? "");
}
