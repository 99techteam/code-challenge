import { Pool } from 'pg';

export interface CampaignStats {
  total:     number;
  sent:      number;
  failed:    number;
  opened:    number;
  open_rate: number;
  send_rate: number;
}

export async function getCampaignStats(pool: Pool, campaignId: string): Promise<CampaignStats> {
  const { rows } = await pool.query<{
    total: string; sent: string; failed: string; opened: string;
  }>(`
    SELECT
      COUNT(*)                                          AS total,
      COUNT(*) FILTER (WHERE status = 'sent')           AS sent,
      COUNT(*) FILTER (WHERE status = 'failed')         AS failed,
      COUNT(*) FILTER (WHERE opened_at IS NOT NULL)     AS opened
    FROM campaign_recipients
    WHERE campaign_id = $1
  `, [campaignId]);

  const r = rows[0];
  const total  = Number(r.total);
  const sent   = Number(r.sent);
  const failed = Number(r.failed);
  const opened = Number(r.opened);

  return {
    total,
    sent,
    failed,
    opened,
    open_rate: sent > 0 ? Math.round((opened / sent) * 10000) / 100 : 0,
    send_rate: total > 0 ? Math.round((sent   / total) * 10000) / 100 : 0,
  };
}

export async function getOrCreateRecipient(
  pool: Pool,
  email: string,
  name = ''
): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(`
    INSERT INTO recipients (email, name)
    VALUES ($1, $2)
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `, [email, name || email.split('@')[0]]);
  return rows[0].id;
}
