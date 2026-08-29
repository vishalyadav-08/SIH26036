import { db } from '@/offline/db';
import { SyncOperation, SyncResult } from '@/offline/types';
import { apiClient } from './api';
import axios from 'axios';

class SyncManager {
  private isSyncing = false;
  private batchSize = 5;

  /**
   * Main entry point to attempt synchronization
   */
  async triggerSync(): Promise<void> {
    if (this.isSyncing) return;
    if (!navigator.onLine) return; // Basic network check hint

    this.isSyncing = true;
    try {
      await this.recoverStaleOperations();
      await this.processQueue();
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * If the app crashed while SYNCING, revert them to READY_TO_SYNC
   */
  private async recoverStaleOperations() {
    if (!db) return;
    const staleOperations = await db.syncQueue.where('status').equals('SYNCING').toArray();
    
    // In a real app we might check if they've been syncing for > 5 minutes
    // For now, any SYNCING operation on startup is deemed stale
    for (const op of staleOperations) {
      await db.syncQueue.update(op.clientOperationId, { status: 'READY_TO_SYNC' });
    }
  }

  /**
   * Process the queue in deterministic bounded batches
   */
  private async processQueue() {
    if (!db) return;
    let hasMore = true;

    while (hasMore) {
      // Get batch of READY_TO_SYNC ordered by createdAt ASC
      const batch = await db.syncQueue
        .where('status')
        .equals('READY_TO_SYNC')
        .sortBy('createdAt');
      
      const currentBatch = batch.slice(0, this.batchSize);
      
      if (currentBatch.length === 0) {
        hasMore = false;
        break;
      }

      // Mark batch as SYNCING
      for (const op of currentBatch) {
        await db.syncQueue.update(op.clientOperationId, { 
          status: 'SYNCING',
          attemptCount: op.attemptCount + 1 
        });
      }

      try {
        const response = await apiClient.post('/sync', {
          operations: currentBatch
        });

        const results = response.data.results as SyncResult[];
        
        for (const result of results) {
          await this.processResult(result);
        }

      } catch (error) {
        await this.handleNetworkError(currentBatch, error);
      }
    }
  }

  /**
   * Process a single result returned from the API
   */
  private async processResult(result: SyncResult) {
    if (!db) return;
    
    // Store result log
    await db.syncResults.put({
      ...result,
      resolvedAt: Date.now()
    });

    const queueItem = await db.syncQueue.get(result.clientOperationId);
    if (!queueItem) return;

    if (result.status === 'SYNCED') {
      await db.syncQueue.update(result.clientOperationId, { status: 'SYNCED' });
      
      // Update local draft/cache provenance
      const cache = await db.cachedInspections.get(result.entityId);
      if (cache) {
        await db.cachedInspections.update(result.entityId, { serverVersion: result.serverVersion });
      }
      
      const draft = await db.inspectionDrafts.get(result.entityId);
      if (draft) {
        await db.inspectionDrafts.update(result.entityId, { serverVersion: result.serverVersion });
      }

      // Normally we would delete the item or archive it, but we'll mark SYNCED for UI history
      // await db.syncQueue.delete(result.clientOperationId);

    } else if (result.status === 'FAILED') {
      await db.syncQueue.update(result.clientOperationId, { 
        status: 'FAILED',
        lastError: result.message || 'Validation or Server Error'
      });
    } else if (result.status === 'CONFLICT') {
      await db.syncQueue.update(result.clientOperationId, { 
        status: 'CONFLICT',
        lastError: result.message || 'Server version mismatch'
      });
    }
  }

  /**
   * Handle Axios network errors, rate limiting, etc.
   */
  private async handleNetworkError(batch: SyncOperation[], error: unknown) {
    if (!db) return;

    const status = axios.isAxiosError(error) ? error.response?.status : null;

    for (const op of batch) {
      if (status === 401 || status === 403) {
        // Auth error - must log in again
        await db.syncQueue.update(op.clientOperationId, {
          status: 'FAILED',
          lastError: 'Authentication required'
        });
      } else if (status === 413 || status === 400) {
        // Fatal payload error
        await db.syncQueue.update(op.clientOperationId, {
          status: 'FAILED',
          lastError: 'Payload rejected by server'
        });
      } else {
        // Transient error (500, network loss, 429) -> apply backoff logic implicitly by reverting to READY_TO_SYNC
        // In a full implementation, we'd add an `executeAfter` timestamp for real backoff jitter
        await db.syncQueue.update(op.clientOperationId, {
          status: 'READY_TO_SYNC',
          lastError: error instanceof Error ? error.message : 'Network error'
        });
      }
    }
  }

  async retryOperation(clientOperationId: string): Promise<void> {
    if (!db) return;
    await db.syncQueue.update(clientOperationId, {
      status: 'READY_TO_SYNC',
      lastError: undefined
    });
    this.triggerSync();
  }

  async resolveConflict(originalId: string, resolutionPayload: unknown): Promise<void> {
    if (!db) return;
    const original = await db.syncQueue.get(originalId);
    if (!original) return;

    // Create a NEW operation with a NEW UUID for the resolution per spec
    const newOperationId = crypto.randomUUID();
    
    await db.syncQueue.put({
      ...original,
      clientOperationId: newOperationId,
      operationType: 'UPDATE_DRAFT', // or RESOLVE_CONFLICT if API supports
      payload: resolutionPayload,
      status: 'READY_TO_SYNC',
      attemptCount: 0,
      createdAt: Date.now(),
      lastError: undefined
    });

    // Archive or update the old conflict to not clog the queue
    await db.syncQueue.update(originalId, { status: 'SYNCED' }); // Or mark as ARCHIVED if state existed

    this.triggerSync();
  }
}

export const syncService = new SyncManager();
