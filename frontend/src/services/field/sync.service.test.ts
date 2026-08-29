import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '@/offline/db';
import { syncService } from './sync.service';
import { apiClient } from './api';

// Mock dependencies
vi.mock('@/offline/db', () => ({
  db: {
    syncQueue: {
      where: vi.fn(),
      update: vi.fn(),
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      toArray: vi.fn(),
    },
    syncResults: {
      put: vi.fn(),
    },
    cachedInspections: {
      get: vi.fn(),
      update: vi.fn(),
    },
    inspectionDrafts: {
      get: vi.fn(),
      update: vi.fn(),
    }
  }
}));

vi.mock('./api', () => ({
  apiClient: {
    post: vi.fn(),
  }
}));

// Provide minimal mock for navigator
Object.defineProperty(global, 'navigator', {
  value: { onLine: true },
  writable: true
});

describe('SyncManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns for db chaining
    const mockWhere = {
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
        sortBy: vi.fn().mockResolvedValue([])
      })
    };
    (db.syncQueue.where as unknown).mockReturnValue(mockWhere);
  });

  it('recovers stale SYNCING operations to READY_TO_SYNC', async () => {
    const mockWhere = {
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([{ clientOperationId: 'stale-1' }])
      })
    };
    (db.syncQueue.where as unknown).mockReturnValue(mockWhere);
    
    // Simulate empty ready queue so loop stops
    mockWhere.equals.mockReturnValueOnce({
      toArray: vi.fn().mockResolvedValue([{ clientOperationId: 'stale-1' }])
    }).mockReturnValueOnce({
      sortBy: vi.fn().mockResolvedValue([]) // No READY_TO_SYNC items
    });

    await syncService.triggerSync();

    expect(db.syncQueue.update).toHaveBeenCalledWith('stale-1', { status: 'READY_TO_SYNC' });
  });

  it('processes READY_TO_SYNC batch and marks as SYNCED', async () => {
    const op = { clientOperationId: 'op-1', status: 'READY_TO_SYNC', attemptCount: 0 };
    
    // Mock the queue fetching
    (db.syncQueue.where as unknown).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]), // for stale check
        sortBy: vi.fn()
          .mockResolvedValueOnce([op]) // first batch
          .mockResolvedValueOnce([])   // second iteration empty
      })
    });

    (apiClient.post as unknown).mockResolvedValue({
      data: {
        results: [{
          clientOperationId: 'op-1',
          status: 'SYNCED',
          entityId: 'entity-1',
          serverVersion: '2'
        }]
      }
    });

    (db.syncQueue.get as unknown).mockResolvedValue(op);

    await syncService.triggerSync();

    // Mark as syncing
    expect(db.syncQueue.update).toHaveBeenCalledWith('op-1', expect.objectContaining({ status: 'SYNCING' }));
    
    // API called
    expect(apiClient.post).toHaveBeenCalledWith('/sync', { operations: [op] });
    
    // Mark as synced
    expect(db.syncQueue.update).toHaveBeenCalledWith('op-1', expect.objectContaining({ status: 'SYNCED' }));
    expect(db.syncResults.put).toHaveBeenCalled();
  });

  it('handles API failure by marking FAILED', async () => {
    const op = { clientOperationId: 'op-2', status: 'READY_TO_SYNC', attemptCount: 0 };
    
    (db.syncQueue.where as unknown).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([]),
        sortBy: vi.fn().mockResolvedValueOnce([op]).mockResolvedValueOnce([])
      })
    });

    // Mock validation error
    (apiClient.post as unknown).mockResolvedValue({
      data: {
        results: [{
          clientOperationId: 'op-2',
          status: 'FAILED',
          message: 'Invalid fields'
        }]
      }
    });

    (db.syncQueue.get as unknown).mockResolvedValue(op);

    await syncService.triggerSync();

    expect(db.syncQueue.update).toHaveBeenCalledWith('op-2', expect.objectContaining({ 
      status: 'FAILED', 
      lastError: 'Invalid fields' 
    }));
  });

  it('re-uses the same operation ID on explicit retry (idempotency)', async () => {
    await syncService.retryOperation('failed-op-1');
    expect(db.syncQueue.update).toHaveBeenCalledWith('failed-op-1', {
      status: 'READY_TO_SYNC',
      lastError: undefined
    });
  });

  it('resolves conflict by creating a new operation ID', async () => {
    const originalOp = { clientOperationId: 'conflict-1', payload: { data: 'old' } };
    (db.syncQueue.get as unknown).mockResolvedValue(originalOp);

    await syncService.resolveConflict('conflict-1', { data: 'new' });

    // Ensure the original is marked synced/archived
    expect(db.syncQueue.update).toHaveBeenCalledWith('conflict-1', { status: 'SYNCED' });

    // Ensure a new UUID is generated
    expect(db.syncQueue.put).toHaveBeenCalledWith(expect.objectContaining({
      clientOperationId: expect.not.stringMatching('conflict-1'), // New UUID
      operationType: 'UPDATE_DRAFT',
      payload: { data: 'new' },
      status: 'READY_TO_SYNC'
    }));
  });
});
