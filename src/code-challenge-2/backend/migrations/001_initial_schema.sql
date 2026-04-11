-- migration: 001_initial_schema
-- creates all tables, indexes, and constraints for the campaign manager

-- users
CREATE TABLE IF NOT EXISTS users (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        NOT NULL UNIQUE,
  name       TEXT        NOT NULL,
  password   TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  subject      TEXT        NOT NULL,
  body         TEXT        NOT NULL DEFAULT '',
  status       TEXT        NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft', 'scheduled', 'sending', 'sent')),
  scheduled_at TIMESTAMPTZ,
  created_by   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- recipients
CREATE TABLE IF NOT EXISTS recipients (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        NOT NULL UNIQUE,
  name       TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- campaign_recipients (join table with delivery tracking)
CREATE TABLE IF NOT EXISTS campaign_recipients (
  campaign_id  UUID        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  recipient_id UUID        NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at      TIMESTAMPTZ,
  opened_at    TIMESTAMPTZ,
  PRIMARY KEY (campaign_id, recipient_id)
);

-- indexes
-- campaigns: filter by status and sort by created_at (list view)
CREATE INDEX IF NOT EXISTS idx_campaigns_status      ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by  ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at  ON campaigns(created_at DESC);

-- campaign_recipients: aggregate stats per campaign quickly
CREATE INDEX IF NOT EXISTS idx_cr_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_cr_status      ON campaign_recipients(campaign_id, status);
