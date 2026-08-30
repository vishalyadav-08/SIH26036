import { apiClient } from './api';
import { mockProfile } from '@/lib/mock/field-data';

const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export const userService = {
  async getMe(): Promise<UserProfile> {
    if (useMockApi) {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 400));
      return {
        name: mockProfile.name,
        email: mockProfile.email,
        role: mockProfile.role,
      };
    }
    const res = await apiClient.get('/users/me');
    return res.data;
  }
};
