export type ApplicationState =
  | "DRAFT"
  | "SUBMITTED"
  | "ASSIGNED"
  | "SCHEDULED"
  | "INSPECTION_IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export interface Application {
  /** Workflow state only. NOT the inspection result — a FAIL still COMPLETEs. */
  id: string;
  applicationNumber: string;
  instrumentId: string;
  instrumentNumber: string;
  instrumentType: string;
  businessId: string;
  businessName?: string;
  state: ApplicationState;
  reason: string;
  scheduledDate?: string;
  /** The current CONFIRMED appointment; null until scheduled. */
  schedule?: {
    id: string;
    officerUserId: string;
    officerName: string;
    scheduledAt: string;
    scheduleNote: string;
    status: "CONFIRMED";
  } | null;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  certificateId?: string;
  certificateNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateApplicationDto {
  instrumentId: string;
  reason: string;
  submit?: boolean;
}
