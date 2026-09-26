import { api } from '@/lib/api';

export const StandardsService = {
  getInventory: async () => {
    return api.get('/standards/inventory/');
  },
  
  getAllocations: async () => {
    return api.get('/standards/allocations/');
  },
  
  getEquipment: async () => {
    return api.get('/standards/equipment/');
  }
};
