import { api } from '@/lib/api';

export interface FeeCalculationParams {
  service_type: string;
  validity_years?: number;
  state_code?: string;
}

export interface PaymentInitiationParams {
  service_type: string;
  related_entity_type: string;
  related_entity_id: string;
  validity_years?: number;
}

export const PaymentsService = {
  getFeeSchedule: async () => {
    return api.get('/payments/fees/');
  },
  
  calculateFee: async (params: FeeCalculationParams) => {
    return api.post('/payments/fees/calculate/', params);
  },
  
  initiatePayment: async (params: PaymentInitiationParams) => {
    return api.post('/payments/initiate/', params);
  },
  
  getPayments: async () => {
    return api.get('/payments/');
  },
  
  getPayment: async (id: string) => {
    return api.get(`/payments/${id}/`);
  }
};
