import { api } from './client';
import { API_BASE_URL } from '../config/env';

export const CONSULT_PRODUCTS = {
  consult_30min: { minutes: 30, fallbackPrice: '$8.00', label: '30 minutes' },
  consult_60min: { minutes: 60, fallbackPrice: '$15.00', label: '1 hour' },
} as const;
export type ConsultSku = keyof typeof CONSULT_PRODUCTS;

export interface ConsultFile { id: string; filename: string; size: number }
export interface Booking {
  id: string;
  minutes: number;
  status: 'paid' | 'submitted';
  upload_token: string;
  created_at: string | null;
  files: ConsultFile[];
}
export interface ConsultForm {
  full_name: string; email: string; country: string; education_level: string;
  study_interest: string; applied_scholarships: string; academic_summary: string;
  availability: string; notes: string;
}

export const ConsultationsApi = {
  verify: (purchase_token: string, product_id: string): Promise<Booking> =>
    api.post('/consultations/verify', { purchase_token, product_id }, { auth: true }),
  mine: (): Promise<Booking[]> => api.get('/consultations/mine', { auth: true }),
  submit: (id: string, form: ConsultForm): Promise<{ ok: boolean; email_sent: boolean }> =>
    api.post(`/consultations/${id}/submit`, form, { auth: true }),
  uploadUrl: (token: string) =>
    `${String(API_BASE_URL).replace(/\/+$/, '')}/consultations/upload-page#t=${encodeURIComponent(token)}`,
};
