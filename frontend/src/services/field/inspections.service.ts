import { IInspectionRepository } from './api/IInspectionRepository';
import { MockApiAdapter } from './api/MockApiAdapter';
import { RealApiAdapter } from './api/RealApiAdapter';

// For the SIH prototype demo, we default to the mock adapter if the env var isn't explicitly false.
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

// Export the selected repository interface so the UI remains completely decoupled.
export const inspectionsService: IInspectionRepository = useMockApi 
  ? new MockApiAdapter() 
  : new RealApiAdapter();

export type { ReadingPayload, DecisionPayload } from './api/IInspectionRepository';
