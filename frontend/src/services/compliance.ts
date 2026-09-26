import { api } from '@/lib/api';

export const ComplianceService = {
  getReturns: async () => {
    return api.get('/compliance/returns/');
  },
  
  getReturn: async (id: string) => {
    return api.get(`/compliance/returns/${id}/`);
  },
  
  createReturn: async (data: { license: string, financial_year: string, quarter: string }) => {
    return api.post('/compliance/returns/', data);
  },
  
  submitReturn: async (id: string) => {
    return api.post(`/compliance/returns/${id}/submit/`);
  },
  
  addProductionRecord: async (returnId: string, data: any) => {
    return api.post(`/compliance/returns/${returnId}/production/`, data);
  },
  
  addSaleRecord: async (returnId: string, data: any) => {
    return api.post(`/compliance/returns/${returnId}/sales/`, data);
  },
  
  addRepairRecord: async (returnId: string, data: any) => {
    return api.post(`/compliance/returns/${returnId}/repairs/`, data);
  }
};
