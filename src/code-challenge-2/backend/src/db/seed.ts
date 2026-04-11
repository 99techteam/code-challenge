import bcrypt from 'bcryptjs';
import { pool } from './pool';

async function seed() {
  // demo user
  const hash = await bcrypt.hash('password123', 10);
  const { rows: [user] } = await pool.query<{ id: string }>(`
    INSERT INTO users (email, name, password)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `, ['demo@example.com', 'Demo User', hash]);

  // demo recipients
  const recipientEmails = [
    { email: 'alice@example.com', name: 'Alice' },
    { email: 'bob@example.com',   name: 'Bob'   },
    { email: 'carol@example.com', name: 'Carol' },
    { email: 'dave@example.com',  name: 'Dave'  },
    { email: 'eve@example.com',   name: 'Eve'   },
  ];

  const recipientIds: string[] = [];
  for (const r of recipientEmails) {
    const { rows: [rec] } = await pool.query<{ id: string }>(`
      INSERT INTO recipients (email, name)
      VALUES ($1, $2)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [r.email, r.name]);
    recipientIds.push(rec.id);
  }

  // draft campaign
  const { rows: [draft] } = await pool.query<{ id: string }>(`
    INSERT INTO campaigns (name, subject, body, status, created_by)
    VALUES ($1, $2, $3, 'draft', $4)
    RETURNING id
  `, ['Welcome Series', 'Welcome to our platform!', 'Hi {{name}}, thanks for joining!', user.id]);

  for (const rid of recipientIds.slice(0, 3)) {
    await pool.query(`
      INSERT INTO campaign_recipients (campaign_id, recipient_id)
      VALUES ($1, $2) ON CONFLICT DO NOTHING
    `, [draft.id, rid]);
  }

  // sent campaign
  const { rows: [sent] } = await pool.query<{ id: string }>(`
    INSERT INTO campaigns (name, subject, body, status, created_by)
    VALUES ($1, $2, $3, 'sent', $4)
    RETURNING id
  `, ['Product Launch', 'Exciting news!', 'We just launched something amazing.', user.id]);

  const now = new Date();
  for (let i = 0; i < recipientIds.length; i++) {
    const opened = i < 3;
    await pool.query(`
      INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
      VALUES ($1, $2, 'sent', $3, $4) ON CONFLICT DO NOTHING
    `, [sent.id, recipientIds[i], now, opened ? now : null]);
  }

  console.log('seed complete');
  console.log('  login: demo@example.com / password123');
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
