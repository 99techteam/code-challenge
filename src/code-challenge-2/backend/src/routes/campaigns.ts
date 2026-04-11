import { Router, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';
import {
  createCampaignSchema,
  updateCampaignSchema,
  scheduleSchema,
  listCampaignsSchema,
} from '../validators/campaign';
import { getCampaignStats, getOrCreateRecipient } from '../services/campaign.service';

const router = Router();

function zodErr(err: ZodError, res: Response) {
  return res.status(400).json({
    error: 'validation_error',
    details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
  });
}

// GET /campaigns
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = listCampaignsSchema.parse(req.query);
    const offset = (q.page - 1) * q.limit;

    const conditions = ['c.created_by = $1'];
    const params: unknown[] = [req.user!.userId];

    if (q.status) {
      conditions.push(`c.status = $${params.length + 1}`);
      params.push(q.status);
    }

    const where = conditions.join(' AND ');

    const { rows: [{ count }] } = await pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM campaigns c WHERE ${where}`, params
    );

    const { rows } = await pool.query(`
      SELECT c.*,
        COUNT(cr.recipient_id)                                    AS total_recipients,
        COUNT(cr.recipient_id) FILTER (WHERE cr.status = 'sent') AS sent_count
      FROM campaigns c
      LEFT JOIN campaign_recipients cr ON cr.campaign_id = c.id
      WHERE ${where}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, q.limit, offset]);

    return res.json({
      data: rows,
      meta: { total: Number(count), page: q.page, limit: q.limit, totalPages: Math.ceil(Number(count) / q.limit) },
    });
  } catch (err) {
    if (err instanceof ZodError) return zodErr(err, res);
    next(err);
  }
});

// POST /campaigns
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createCampaignSchema.parse(req.body);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { rows: [campaign] } = await client.query(`
        INSERT INTO campaigns (name, subject, body, created_by)
        VALUES ($1, $2, $3, $4) RETURNING *
      `, [body.name, body.subject, body.body, req.user!.userId]);

      for (const email of body.recipients) {
        const recipientId = await getOrCreateRecipient(client as unknown as typeof pool, email);
        await client.query(`
          INSERT INTO campaign_recipients (campaign_id, recipient_id)
          VALUES ($1, $2) ON CONFLICT DO NOTHING
        `, [campaign.id, recipientId]);
      }

      await client.query('COMMIT');
      return res.status(201).json({ data: campaign });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    if (err instanceof ZodError) return zodErr(err, res);
    next(err);
  }
});

// GET /campaigns/:id
router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.* FROM campaigns c
      WHERE c.id = $1 AND c.created_by = $2
    `, [req.params.id, req.user!.userId]);

    if (rows.length === 0) return res.status(404).json({ error: 'campaign not found' });

    const campaign = rows[0];
    const stats = await getCampaignStats(pool, campaign.id);

    const { rows: recipients } = await pool.query(`
      SELECT r.id, r.email, r.name, cr.status, cr.sent_at, cr.opened_at
      FROM campaign_recipients cr
      JOIN recipients r ON r.id = cr.recipient_id
      WHERE cr.campaign_id = $1
      ORDER BY r.email
    `, [campaign.id]);

    return res.json({ data: { ...campaign, stats, recipients } });
  } catch (err) {
    next(err);
  }
});

// PATCH /campaigns/:id
router.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1 AND created_by = $2',
      [req.params.id, req.user!.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'campaign not found' });

    const campaign = rows[0];
    // business rule: only draft campaigns can be edited
    if (campaign.status !== 'draft') {
      return res.status(422).json({ error: 'only draft campaigns can be edited' });
    }

    const body = updateCampaignSchema.parse(req.body);
    const entries = Object.entries(body);
    const setClauses = entries.map(([k], i) => `${k} = $${i + 3}`).join(', ');
    const values = entries.map(([, v]) => v);

    const { rows: [updated] } = await pool.query(`
      UPDATE campaigns SET ${setClauses}, updated_at = now()
      WHERE id = $1 AND created_by = $2 RETURNING *
    `, [req.params.id, req.user!.userId, ...values]);

    return res.json({ data: updated });
  } catch (err) {
    if (err instanceof ZodError) return zodErr(err, res);
    next(err);
  }
});

// DELETE /campaigns/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      'SELECT status FROM campaigns WHERE id = $1 AND created_by = $2',
      [req.params.id, req.user!.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'campaign not found' });

    // business rule: only draft campaigns can be deleted
    if (rows[0].status !== 'draft') {
      return res.status(422).json({ error: 'only draft campaigns can be deleted' });
    }

    await pool.query('DELETE FROM campaigns WHERE id = $1', [req.params.id]);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /campaigns/:id/schedule
router.post('/:id/schedule', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1 AND created_by = $2',
      [req.params.id, req.user!.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'campaign not found' });

    if (rows[0].status !== 'draft') {
      return res.status(422).json({ error: 'only draft campaigns can be scheduled' });
    }

    const body = scheduleSchema.parse(req.body);

    const { rows: [updated] } = await pool.query(`
      UPDATE campaigns SET status = 'scheduled', scheduled_at = $1, updated_at = now()
      WHERE id = $2 RETURNING *
    `, [body.scheduled_at, req.params.id]);

    return res.json({ data: updated });
  } catch (err) {
    if (err instanceof ZodError) return zodErr(err, res);
    next(err);
  }
});

// POST /campaigns/:id/send
router.post('/:id/send', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1 AND created_by = $2',
      [req.params.id, req.user!.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'campaign not found' });

    const campaign = rows[0];
    if (campaign.status === 'sent') {
      return res.status(422).json({ error: 'campaign already sent' });
    }
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return res.status(422).json({ error: 'campaign cannot be sent in its current status' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // mark campaign as sending first
      await client.query(
        "UPDATE campaigns SET status = 'sending', updated_at = now() WHERE id = $1",
        [campaign.id]
      );

      // simulate sending: mark all pending recipients as sent
      const now = new Date();
      await client.query(`
        UPDATE campaign_recipients
        SET status = 'sent', sent_at = $1
        WHERE campaign_id = $2 AND status = 'pending'
      `, [now, campaign.id]);

      // transition to sent
      const { rows: [updated] } = await client.query(`
        UPDATE campaigns SET status = 'sent', updated_at = now()
        WHERE id = $1 RETURNING *
      `, [campaign.id]);

      await client.query('COMMIT');
      return res.json({ data: updated });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// GET /campaigns/:id/stats
router.get('/:id/stats', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1 AND created_by = $2',
      [req.params.id, req.user!.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'campaign not found' });

    const stats = await getCampaignStats(pool, req.params.id);
    return res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

export default router;
