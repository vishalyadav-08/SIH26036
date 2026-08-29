import { IInspectionRepository, ReadingPayload, DecisionPayload } from './IInspectionRepository';
import { Inspection } from '@/offline/types';
import { apiClient } from '../api';

export class RealApiAdapter implements IInspectionRepository {
  async getAssigned(): Promise<Inspection[]> {
    // Documented API: GET /api/v1/applications
    // In reality, this might be filtered for the current officer or 
    // mapped from a combination of applications & inspections.
    const res = await apiClient.get('/applications');
    return res.data;
  }

  async getById(id: string): Promise<Inspection> {
    const res = await apiClient.get(`/inspections/${id}`);
    return res.data;
  }

  async startInspection(id: string): Promise<Inspection> {
    const res = await apiClient.post(`/inspections`, { applicationId: id });
    return res.data;
  }

  async saveReading(id: string, payload: ReadingPayload): Promise<void> {
    await apiClient.post(`/inspections/${id}/readings`, payload);
  }

  async uploadEvidence(id: string, file: File): Promise<{ url: string }> {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Payload Too Large: Evidence file exceeds 10 MiB.');
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: JPG, PNG, WEBP, PDF.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post(`/inspections/${id}/evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return { url: res.data.url };
  }

  async submitDecision(id: string, payload: DecisionPayload): Promise<void> {
    await apiClient.post(`/inspections/${id}/decision`, payload);
  }
}
