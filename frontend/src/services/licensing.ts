import { api } from '@/lib/api';
import { z } from 'zod';

export const licenseCategoryEnum = z.enum(['MANUFACTURER', 'DEALER', 'REPAIRER', 'PACKER_IMPORTER']);
export const licenseTypeEnum = z.enum(['NEW', 'RENEWAL', 'AMENDMENT', 'DUPLICATE']);

export const licenseApplicationSchema = z.object({
  id: z.string().optional(),
  application_number: z.string().optional(),
  category: licenseCategoryEnum,
  license_type: licenseTypeEnum,
  validity_years: z.number().min(1).max(10),
  premises_address: z.string().min(1, 'Premises address is required'),
  premises_proof_type: z.string().min(1, 'Premises proof type is required'),
  gst_number: z.string().optional(),
  pan_number: z.string().optional(),
  machinery_list: z.array(z.any()).optional(),
  technical_staff_count: z.number().optional(),
  qualification_details: z.string().optional(),
  equipment_list: z.array(z.any()).optional(),
  dealership_authorization: z.string().optional(),
  commodity_list: z.array(z.any()).optional(),
  iec_code: z.string().optional(),
});

export type LicenseApplicationPayload = z.infer<typeof licenseApplicationSchema>;

export const LicensingService = {
  getApplications: async () => {
    return api.get('/licenses/applications/');
  },
  
  getApplication: async (id: string) => {
    return api.get(`/licenses/applications/${id}/`);
  },
  
  createApplication: async (data: LicenseApplicationPayload) => {
    return api.post('/licenses/applications/', data);
  },
  
  submitApplication: async (id: string) => {
    return api.post(`/licenses/applications/${id}/submit/`);
  },
  
  getLicenses: async () => {
    return api.get('/licenses/');
  }
};
