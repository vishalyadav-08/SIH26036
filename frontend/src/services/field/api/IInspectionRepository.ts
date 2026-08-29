import { Inspection } from '@/offline/types';

export type ReadingPayload = {
  testPoint: number;
  referenceValue: number;
  indicatedValue: number;
  unit: string;
  errorValue: number;
  sequence: number;
  capturedAt: string;
  notes?: string;
};

export type DecisionPayload = {
  decision: 'PASS' | 'FAIL' | 'REQUIRES_CORRECTION';
  notes?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null;
};

export interface IInspectionRepository {
  getAssigned(): Promise<Inspection[]>;
  getById(id: string): Promise<Inspection>;
  startInspection(id: string): Promise<Inspection>;
  saveReading(id: string, payload: ReadingPayload): Promise<void>;
  uploadEvidence(id: string, file: File): Promise<{ url: string }>;
  submitDecision(id: string, payload: DecisionPayload): Promise<void>;
}
