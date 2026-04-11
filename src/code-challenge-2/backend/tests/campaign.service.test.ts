import { getCampaignStats } from '../src/services/campaign.service';
import type { Pool } from 'pg';

function makePool(rows: Record<string, string>): Pool {
  return {
    query: jest.fn().mockResolvedValue({ rows: [rows] }),
  } as unknown as Pool;
}

describe('getCampaignStats', () => {
  it('returns zero rates when total is 0', async () => {
    const pool = makePool({ total: '0', sent: '0', failed: '0', opened: '0' });
    const stats = await getCampaignStats(pool, 'campaign-id');
    expect(stats).toEqual({ total: 0, sent: 0, failed: 0, opened: 0, open_rate: 0, send_rate: 0 });
  });

  it('calculates open_rate and send_rate correctly', async () => {
    const pool = makePool({ total: '10', sent: '8', failed: '2', opened: '4' });
    const stats = await getCampaignStats(pool, 'campaign-id');
    expect(stats.send_rate).toBe(80);   // 8/10
    expect(stats.open_rate).toBe(50);   // 4/8
    expect(stats.total).toBe(10);
    expect(stats.sent).toBe(8);
    expect(stats.failed).toBe(2);
    expect(stats.opened).toBe(4);
  });

  it('returns 0 open_rate when sent is 0', async () => {
    const pool = makePool({ total: '5', sent: '0', failed: '5', opened: '0' });
    const stats = await getCampaignStats(pool, 'campaign-id');
    expect(stats.open_rate).toBe(0);
    expect(stats.send_rate).toBe(0);
  });
});
