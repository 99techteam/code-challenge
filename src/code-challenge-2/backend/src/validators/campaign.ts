import { z } from 'zod';

export const createCampaignSchema = z.object({
  name:       z.string().min(1).max(255),
  subject:    z.string().min(1).max(500),
  body:       z.string().min(1),
  recipients: z.array(z.string().email()).min(1, 'at least one recipient required'),
});

export const updateCampaignSchema = z.object({
  name:    z.string().min(1).max(255).optional(),
  subject: z.string().min(1).max(500).optional(),
  body:    z.string().min(1).optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'at least one field required' });

export const scheduleSchema = z.object({
  scheduled_at: z.string().datetime({ message: 'must be a valid ISO datetime' }),
}).refine(
  d => new Date(d.scheduled_at) > new Date(),
  { message: 'scheduled_at must be a future timestamp', path: ['scheduled_at'] }
);

export const listCampaignsSchema = z.object({
  status: z.enum(['draft', 'scheduled', 'sending', 'sent']).optional(),
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
});
