import { db } from '@/offline/db';
import { CachedInspection, InspectionDraft, SyncOperation, LocalState } from '@/offline/types';
import { Inspection } from '@/lib/mock/field-data';

export const offlineService = {
  async cacheInspection(inspection: Inspection): Promise<void> {
    if (!db) return; // SSR safe
    await db.cachedInspections.put({
      inspectionId: inspection.id,
      applicationId: inspection.applicationNumber,
      snapshot: inspection,
      serverVersion: new Date().toISOString(), // Mock server version
      cachedAt: Date.now(),
      localState: 'LOCAL_DRAFT'
    });
  },

  async getCachedInspection(id: string): Promise<CachedInspection | undefined> {
    if (!db) return undefined;
    return db.cachedInspections.get(id);
  },

  async getInspectionDraft(id: string): Promise<InspectionDraft | undefined> {
    if (!db) return undefined;
    return db.inspectionDrafts.get(id);
  },

  async saveDraft(id: string, updates: Partial<InspectionDraft>): Promise<void> {
    if (!db) return;
    const existing = await db.inspectionDrafts.get(id);
    if (existing) {
      await db.inspectionDrafts.put({ ...existing, ...updates, updatedAt: Date.now() });
    } else {
      await db.inspectionDrafts.put({
        inspectionId: id,
        readings: [],
        serverVersion: '1',
        localState: 'LOCAL_DRAFT',
        updatedAt: Date.now(),
        ...updates
      });
    }
  },

  async enqueueSyncOperation(op: Omit<SyncOperation, 'createdAt' | 'status' | 'attemptCount'>): Promise<void> {
    if (!db) return;
    await db.syncQueue.put({
      ...op,
      createdAt: Date.now(),
      status: 'READY_TO_SYNC',
      attemptCount: 0
    });
  },

  async getPendingSyncs(): Promise<SyncOperation[]> {
    if (!db) return [];
    return db.syncQueue.where('status').equals('READY_TO_SYNC').toArray();
  }
};
