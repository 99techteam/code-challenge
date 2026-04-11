/**
 * Business rules tests — these test the route-level logic in isolation
 * by mocking the pool and verifying HTTP responses via supertest.
 *
 * Rules under test:
 *   1. A campaign can only be edited when status is 'draft'
 *   2. A campaign can only be deleted when status is 'draft'
 *   3. A sent campaign cannot be sent again
 *   4. scheduled_at must be in the future (covered in validators.test.ts)
 */

import request from 'supertest';
import app from '../src/index';
import { pool } from '../src/db/pool';
import jwt from 'jsonwebtoken';

jest.mock('../src/db/pool', () => ({
  pool: { query: jest.fn(), connect: jest.fn() },
}));

const mockPool = pool as jest.Mocked<typeof pool>;

const USER_ID = 'user-uuid-1';
const CAMPAIGN_ID = 'campaign-uuid-1';
const TOKEN = jwt.sign({ userId: USER_ID, email: 'test@test.com' }, 'dev-secret');
const AUTH = `Bearer ${TOKEN}`;

beforeEach(() => jest.clearAllMocks());

describe('PATCH /campaigns/:id — edit only draft', () => {
  it('returns 422 when campaign is not draft', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: CAMPAIGN_ID, status: 'sent', created_by: USER_ID }] });

    const res = await request(app)
      .patch(`/campaigns/${CAMPAIGN_ID}`)
      .set('Authorization', AUTH)
      .send({ name: 'New Name' });

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/draft/i);
  });

  it('returns 200 when campaign is draft', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: CAMPAIGN_ID, status: 'draft', created_by: USER_ID }] })
      .mockResolvedValueOnce({ rows: [{ id: CAMPAIGN_ID, status: 'draft', name: 'New Name' }] });

    const res = await request(app)
      .patch(`/campaigns/${CAMPAIGN_ID}`)
      .set('Authorization', AUTH)
      .send({ name: 'New Name' });

    expect(res.status).toBe(200);
  });
});

describe('DELETE /campaigns/:id — delete only draft', () => {
  it('returns 422 when campaign is scheduled', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ status: 'scheduled' }] });

    const res = await request(app)
      .delete(`/campaigns/${CAMPAIGN_ID}`)
      .set('Authorization', AUTH);

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/draft/i);
  });

  it('returns 204 when campaign is draft', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ status: 'draft' }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete(`/campaigns/${CAMPAIGN_ID}`)
      .set('Authorization', AUTH);

    expect(res.status).toBe(204);
  });
});

describe('POST /campaigns/:id/send — cannot re-send', () => {
  it('returns 422 when campaign is already sent', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ id: CAMPAIGN_ID, status: 'sent', created_by: USER_ID }] });

    const res = await request(app)
      .post(`/campaigns/${CAMPAIGN_ID}/send`)
      .set('Authorization', AUTH);

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/already sent/i);
  });
});
