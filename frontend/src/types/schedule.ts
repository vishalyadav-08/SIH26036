/**
 * One booked site visit (backend scheduling.Schedule).
 *
 * CONFIRMED is the current appointment. RESCHEDULED and CANCELLED rows are
 * history: the calendar hides them unless asked for.
 */
export type ScheduleStatus = "CONFIRMED" | "RESCHEDULED" | "CANCELLED";

export interface Schedule {
  id: string;
  applicationId: string;
  applicationNumber: string;
  applicationState: string;
  instrumentId: string;
  instrumentNumber: string;
  instrumentType: string;
  location: string;
  businessId: string;
  businessName: string;
  officerUserId: string;
  officerName: string;
  scheduledByUserId: string | null;
  scheduledAt: string;
  scheduleNote: string;
  status: ScheduleStatus;
  endedAt: string | null;
  endReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleQuery {
  /** Defaults to CONFIRMED on the server; pass "ALL" for history. */
  status?: ScheduleStatus | "ALL";
  officerUserId?: string;
  applicationId?: string;
  /** YYYY-MM-DD (whole day) or an ISO datetime. */
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
