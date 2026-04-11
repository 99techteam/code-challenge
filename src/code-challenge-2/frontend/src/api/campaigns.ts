import { api } from './client';

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent';
  scheduled_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  total_recipients?: number;
  sent_count?: number;
}

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
}

export interface Recipient {
  id: string;
  email: string;
  name: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  opened_at: string | null;
}

export interface CampaignDetail extends Campaign {
  stats: CampaignStats;
  recipients: Recipient[];
}

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const campaignsApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<{ data: Campaign[]; meta: ListMeta }>('/campaigns', { params }).then(r => r.data),

  get: (id: string) =>
    api.get<{ data: CampaignDetail }>(`/campaigns/${id}`).then(r => r.data.data),

  create: (body: { name: string; subject: string; body: string; recipients: string[] }) =>
    api.post<{ data: Campaign }>('/campaigns', body).then(r => r.data.data),

  update: (id: string, body: Partial<{ name: string; subject: string; body: string }>) =>
    api.patch<{ data: Campaign }>(`/campaigns/${id}`, body).then(r => r.data.data),

  delete: (id: string) =>
    api.delete(`/campaigns/${id}`),

  schedule: (id: string, scheduled_at: string) =>
    api.post<{ data: Campaign }>(`/campaigns/${id}/schedule`, { scheduled_at }).then(r => r.data.data),

  send: (id: string) =>
    api.post<{ data: Campaign }>(`/campaigns/${id}/send`).then(r => r.data.data),

  stats: (id: string) =>
    api.get<{ data: CampaignStats }>(`/campaigns/${id}/stats`).then(r => r.data.data),
};
