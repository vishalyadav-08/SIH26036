export interface Officer {
  id: string;
  userId: string;
  name: string;
  email: string;
  badgeNumber: string;
  jurisdiction: string;
  activeCaseload: number;
  maxCaseload: number;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  phone: string;
  lastActiveAt?: string;
}

export interface OfficerAssignmentDto {
  officerUserId: string;
  assignmentNote?: string;
}
