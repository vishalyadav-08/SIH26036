export type ApplicationState =
  | "DRAFT"
  | "SUBMITTED"
  | "ASSIGNED"
  | "SCHEDULED"
  | "INSPECTED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export interface Application {
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
