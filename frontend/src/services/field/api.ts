import axios from 'axios';
import { SyncOperation } from '@/offline/types';

// Real Axios instance
export const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

// A robust mock interceptor since the real Django endpoint doesn't exist yet.
// In a real environment, you might toggle this with an env var like NEXT_PUBLIC_MOCK_API.
apiClient.interceptors.request.use(async (config) => {
  if (config.url === '/sync' && config.method === 'post') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const data = JSON.parse(config.data as string) as { operations: SyncOperation[] };
    
    // Process mock rules based on operation payload/type for testing
    const results = data.operations.map(op => {
      // Mock CONFLICT if expectedServerVersion implies a stale client 
      if (op.expectedServerVersion === '3' && (op.payload as unknown)?.triggerConflict) {
        return {
          clientOperationId: op.clientOperationId,
          status: 'CONFLICT',
          entityId: op.entityId,
          serverVersion: '4',
          message: 'This inspection changed on the server while you were offline.'
        };
      }

      // Mock FAILED (Validation/400)
      if ((op.payload as unknown)?.triggerFailure) {
        return {
          clientOperationId: op.clientOperationId,
          status: 'FAILED',
          entityId: op.entityId,
          serverVersion: op.expectedServerVersion,
          message: 'One or more fields are invalid.'
        };
      }

      // Default SYNCED
      return {
        clientOperationId: op.clientOperationId,
        status: 'SYNCED',
        entityId: op.entityId,
        serverVersion: String(Number(op.expectedServerVersion || '1') + 1),
        message: 'Applied'
      };
    });

    // We can simulate an HTTP error by throwing a mocked AxiosError if needed
    // e.g., if (someCondition) throw new Error("Network Error");

    // Return the intercepted response successfully
    config.adapter = async () => {
      return {
        data: { results },
        status: 200,
        statusText: 'OK',
        headers: config.headers as unknown,
        config: config
      };
    };
  }

  return config;
});
