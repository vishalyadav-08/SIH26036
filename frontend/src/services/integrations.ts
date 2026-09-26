import { api } from '@/lib/api';

export const IntegrationsService = {
  getLogs: async () => {
    return api.get('/integrations/logs/');
  },
  
  getDigiLockerDocuments: async () => {
    return api.get('/integrations/digilocker/');
  },
  
  pullDigiLockerDocument: async (docType: string) => {
    return api.post('/integrations/digilocker/pull/', { document_type: docType });
  }
};
