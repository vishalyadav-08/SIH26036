import { api } from "@/lib/api";
import { Paginated } from "@/types/instrument";
import { Schedule, ScheduleQuery } from "@/types/schedule";

export type { Schedule, ScheduleQuery };

/**
 * The calendar. Booking the first visit is an application action
 * (applicationsService.schedule); this module reads and moves appointments.
 */
export const schedulesService = {
  async list(params: ScheduleQuery = {}) {
    const { data } = await api.get<Paginated<Schedule>>("/schedules/", { params });

    return data;
  },

  async get(id: string): Promise<Schedule> {
    const { data } = await api.get<Schedule>(`/schedules/${id}/`);

    return data;
  },

  /** Returns the replacement appointment; the old one becomes RESCHEDULED. */
  async reschedule(id: string, scheduledAt: string, scheduleNote = "") {
    const { data } = await api.post<Schedule>(`/schedules/${id}/reschedule/`, {
      scheduledAt,
      scheduleNote,
    });

    return data;
  },
};

export default schedulesService;

export async function getSchedules(params: ScheduleQuery = {}) {
  return (await schedulesService.list(params)).items;
}

export async function rescheduleVisit(id: string, scheduledAt: string, note?: string) {
  return schedulesService.reschedule(id, scheduledAt, note ?? "");
}
