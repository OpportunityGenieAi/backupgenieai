import { api } from './client';

export type SortKey = 'latest' | 'closing';

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  country: string;
  level: string;
  field: string;
  funding: string;
  deadline_window: string;
  official_link: string;
  tags: string[];
  blurb: string;
  deadline_date?: string | null;   // exact closing date (YYYY-MM-DD) when known
  source_url?: string | null;
  last_verified?: string | null;
  is_active?: boolean;
  match_score?: number | null;
  match_tier?: 'green' | 'yellow' | 'red' | null;
}

export const ScholarshipsApi = {
  async list(params: { q?: string; region?: string; sort?: SortKey; auth?: boolean } = {}): Promise<Scholarship[]> {
    return api.get('/scholarships', {
      auth: !!params.auth,
      query: {
        q: params.q,
        region: params.region && params.region !== 'All' ? params.region : undefined,
        sort: params.sort,
      },
    });
  },

  async get(id: string, auth = false): Promise<Scholarship> {
    return api.get(`/scholarships/${id}`, { auth });
  },

  async create(payload: Omit<Scholarship, 'id' | 'match_score' | 'match_tier'>): Promise<Scholarship> {
    return api.post('/scholarships', payload, { auth: true });
  },

  async update(id: string, payload: Omit<Scholarship, 'id' | 'match_score' | 'match_tier'>): Promise<Scholarship> {
    return api.put(`/scholarships/${id}`, payload, { auth: true });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/scholarships/${id}`, { auth: true });
  },
};