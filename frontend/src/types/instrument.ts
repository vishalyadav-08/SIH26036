export type InstrumentType =
  | "ELECTRONIC_SCALE"
  | "PLATFORM_SCALE"
  | "COUNTER_SCALE"
  | "WEIGHBRIDGE"
  | "SPRING_BALANCE"
  | "MEASURING_TAPE";

export type InstrumentStatus =
  | "ACTIVE"
  | "PENDING_VERIFICATION"
  | "EXPIRED"
  | "REJECTED";

export interface Instrument {
  id: string;
  instrumentNumber: string;
  serialNumber?: string;
  instrumentType: InstrumentType | string;
  manufacturer: string;
  model: string;
  capacity: number;
  capacityUnit: string;
  location?: string;
  status: InstrumentStatus;
  businessId: string;
  lastVerifiedAt?: string;
  nextVerificationDue?: string;
  activeCertificateNo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RegisterInstrumentDto {
  instrumentNumber: string;
  serialNumber?: string;
  instrumentType: string;
  manufacturer: string;
  model: string;
  capacity: number;
  capacityUnit: string;
  location?: string;
}
