import { api } from '@/lib/api';

export const JurisdictionService = {
  getStates: async () => {
    return api.get('/jurisdiction/states/');
  },
  
  getDivisions: async () => {
    return api.get('/jurisdiction/divisions/');
  },
  
  getDistricts: async () => {
    return api.get('/jurisdiction/districts/');
  },
  
  getAssignments: async () => {
    return api.get('/jurisdiction/assignments/');
  },
  
  resolvePincode: async (pincode: string) => {
    return api.get(`/jurisdiction/assignments/resolve/?pincode=${pincode}`);
  }
};
