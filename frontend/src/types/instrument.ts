export type InstrumentType =
  | "ELECTRONIC_SCALE"
  | "PLATFORM_SCALE"
  | "COUNTER_SCALE"
  | "WEIGHBRIDGE"
  | "SPRING_BALANCE"
  | "FUEL_DISPENSER"
  | "BEAM_SCALE"
  | "WEIGHT_SET"
  | "MEASURING_TAPE"
  | "OTHER";

/**
 * Mirrors the backend's Instrument.Status.
 *
 * REGISTERED and ACTIVE are not the same thing: REGISTERED means recorded but
 * never verified, ACTIVE means a PASS inspection issued a current certificate.
 * Rendering them identically would tell an owner their instrument is verified
 * when it is not.
 */
export type InstrumentStatus =
  | "REGISTERED"
  | "ACTIVE"
  | "PENDING_VERIFICATION"
  | "EXPIRED"
  | "REJECTED"
  | "INACTIVE";

export interface Instrument {
  id: string;
  instrumentNumber: string;
  serialNumber?: string;
  instrumentType: InstrumentType | string;
  manufacturer: string;
  model: string;
  capacity: number | string;
  capacityUnit: string;
  location?: string;
  status: InstrumentStatus;
  businessId: string;
  /** Set when a certificate is issued; null until then. */
  nextDueDate?: string | null;
  /** Same date as nextDueDate, named for the screens that show a due date. */
  nextVerificationDue?: string | null;
  /** Current ACTIVE certificate number, if any. Revoked/expired are excluded. */
  activeCertificateNo?: string | null;
  lastVerifiedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface RegisterInstrumentDto {
  instrumentNumber: string;
  serialNumber?: string;
  instrumentType: string;
  manufacturer: string;
  model: string;
  capacity: number | string;
  capacityUnit: string;
  location?: string;
  businessId?: string;
}

/** The list envelope every collection endpoint returns (API_CONTRACT.md). */
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
