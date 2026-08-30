import { IInspectionRepository, ReadingPayload, DecisionPayload } from './IInspectionRepository';
import { Inspection } from '@/offline/types';;
import { Inspection } from '@/offline/types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiAdapter implements IInspectionRepository {
  async getAssigned(): Promise<Inspection[]> {
    await delay(600);
    return [...mockInspections];
  }

  async getById(id: string): Promise<Inspection> {
    await delay(500);
    const inspection = mockInspections.find(i => i.id === id);
    if (!inspection) throw new Error('Inspection not found');
    return { ...inspection };
  }

  async startInspection(id: string): Promise<Inspection> {
    await delay(800);
    const inspection = mockInspections.find(i => i.id === id);
    if (!inspection) throw new Error('Inspection not found');
    
    return {
      ...inspection,
      applicationState: 'IN_PROGRESS',
    };
  }

  async saveReading(id: string, payload: ReadingPayload): Promise<void> {
    await delay(700);
    return Promise.resolve();
  }

  async uploadEvidence(id: string, file: File): Promise<{ url: string }> {
    await delay(1200);
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Payload Too Large');
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type');
    }
    return { url: URL.createObjectURL(file) };
  }

  async submitDecision(id: string, payload: DecisionPayload): Promise<void> {
    await delay(1500);
    return Promise.resolve();
  }
}
