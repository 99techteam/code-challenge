import { scheduleSchema, createCampaignSchema } from '../src/validators/campaign';
import { registerSchema } from '../src/validators/auth';

describe('scheduleSchema', () => {
  it('rejects a past timestamp', () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const result = scheduleSchema.safeParse({ scheduled_at: past });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toMatch(/future/i);
    }
  });

  it('accepts a future timestamp', () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const result = scheduleSchema.safeParse({ scheduled_at: future });
    expect(result.success).toBe(true);
  });

  it('rejects a non-datetime string', () => {
    const result = scheduleSchema.safeParse({ scheduled_at: 'not-a-date' });
    expect(result.success).toBe(false);
  });
});

describe('createCampaignSchema', () => {
  it('requires at least one recipient', () => {
    const result = createCampaignSchema.safeParse({
      name: 'Test', subject: 'Hi', body: 'Body', recipients: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email in recipients', () => {
    const result = createCampaignSchema.safeParse({
      name: 'Test', subject: 'Hi', body: 'Body', recipients: ['not-an-email'],
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid input', () => {
    const result = createCampaignSchema.safeParse({
      name: 'Test', subject: 'Hi', body: 'Body', recipients: ['a@b.com'],
    });
    expect(result.success).toBe(true);
  });
});

describe('registerSchema', () => {
  it('rejects short password', () => {
    const result = registerSchema.safeParse({ email: 'a@b.com', name: 'A', password: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ email: 'not-email', name: 'A', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({ email: 'a@b.com', name: 'Alice', password: 'password123' });
    expect(result.success).toBe(true);
  });
});
