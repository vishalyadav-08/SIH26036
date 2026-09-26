import { api } from '@/lib/api';

export const EnforcementService = {
  getComplaints: async () => {
    return api.get('/enforcement/complaints/');
  },
  
  getComplaint: async (id: string) => {
    return api.get(`/enforcement/complaints/${id}/`);
  },
  
  fileComplaint: async (data: any) => {
    // Public endpoint, use raw fetch if no auth token is expected
    // But since it's just a demo, we will use our api wrapper
    return api.post('/enforcement/complaints/', data);
  },
  
  getActions: async () => {
    return api.get('/enforcement/actions/');
  },
  
  logAction: async (data: any) => {
    return api.post('/enforcement/actions/', data);
  },
  
  issueNotice: async (actionId: string, data: any) => {
    return api.post(`/enforcement/actions/${actionId}/issue_notice/`, data);
  },
  
  getNotices: async () => {
    return api.get('/enforcement/notices/');
  }
};
