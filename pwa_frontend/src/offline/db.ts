import Dexie, { type Table } from 'dexie';
import { 
  AppMetadata, 
  CachedInspection, 
  InspectionDraft, 
  EvidenceBlob, 
  SyncOperation, 
  SyncResult 
} from './types';

export class FieldAppDatabase extends Dexie {
  appMetadata!: Table<AppMetadata, string>;
  cachedInspections!: Table<CachedInspection, string>;
  inspectionDrafts!: Table<InspectionDraft, string>;
  evidenceBlobs!: Table<EvidenceBlob, number>;
  syncQueue!: Table<SyncOperation, string>;
  syncResults!: Table<SyncResult, number>;

  constructor() {
    super('MapanSetuOffline');
    
    // Schema definition (Version 1)
    this.version(1).stores({
      appMetadata: 'id',
      cachedInspections: 'inspectionId, applicationId, localState',
      inspectionDrafts: 'inspectionId, localState, updatedAt',
      evidenceBlobs: '++id, inspectionId',
      syncQueue: 'clientOperationId, entityId, status, createdAt',
      syncResults: '++id, clientOperationId'
    });
  }
}

// Safely export the db instance ensuring it's only created on the client
// Next.js SSR workaround for IndexedDB
export const db = typeof window !== 'undefined' ? new FieldAppDatabase() : (null as unknown as FieldAppDatabase);
