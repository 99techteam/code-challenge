BEGIN;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(128) NOT NULL UNIQUE,
    display_name VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE actions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    score_delta INTEGER NOT NULL CHECK (score_delta > 0),
    cooldown_seconds INTEGER NOT NULL DEFAULT 0 CHECK (cooldown_seconds >= 0),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    refresh_token_hash TEXT NOT NULL,
    device_id VARCHAR(128),
    ip INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ
);

CREATE TABLE score_action_requests (
    request_id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    action_id BIGINT NOT NULL REFERENCES actions(id),
    session_id UUID REFERENCES user_sessions(session_id),
    idempotency_key VARCHAR(255) NOT NULL,
    action_instance_id VARCHAR(128),
    request_payload JSONB NOT NULL,
    response_code INTEGER,
    response_body JSONB,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE (user_id, idempotency_key)
);

CREATE TABLE score_events (
    event_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    action_id BIGINT NOT NULL REFERENCES actions(id),
    request_id UUID NOT NULL REFERENCES score_action_requests(request_id),
    score_delta INTEGER NOT NULL CHECK (score_delta > 0),
    session_id UUID REFERENCES user_sessions(session_id),
    device_id VARCHAR(128),
    ip INET,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (request_id)
);

CREATE TABLE outbox_events (
    outbox_id BIGSERIAL PRIMARY KEY,
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(128) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    partition_key VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE TABLE fraud_flags (
    flag_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    score_event_id BIGINT REFERENCES score_events(event_id),
    signal_type VARCHAR(64) NOT NULL,
    severity SMALLINT NOT NULL CHECK (severity BETWEEN 1 AND 5),
    details JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE TABLE user_score_materialized_totals (
    user_id BIGINT PRIMARY KEY REFERENCES users(id),
    total_score BIGINT NOT NULL DEFAULT 0,
    action_count BIGINT NOT NULL DEFAULT 0,
    reached_score_at TIMESTAMPTZ,
    last_event_id BIGINT NOT NULL REFERENCES score_events(event_id),
    materialized_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE projection_checkpoints (
    projection_name VARCHAR(100) PRIMARY KEY,
    last_event_id BIGINT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id_active
    ON user_sessions (user_id, revoked_at, expires_at);

CREATE INDEX idx_score_action_requests_requested_at
    ON score_action_requests (requested_at DESC);

CREATE UNIQUE INDEX idx_score_action_requests_user_action_instance
    ON score_action_requests (user_id, action_id, action_instance_id)
    WHERE action_instance_id IS NOT NULL;

CREATE INDEX idx_score_events_user_occurred_at_desc
    ON score_events (user_id, occurred_at DESC);

CREATE INDEX idx_score_events_action_occurred_at_desc
    ON score_events (action_id, occurred_at DESC);

CREATE INDEX idx_score_events_occurred_at_desc
    ON score_events (occurred_at DESC);

CREATE INDEX idx_outbox_events_created_at
    ON outbox_events (created_at);

CREATE INDEX idx_outbox_events_unpublished
    ON outbox_events (published_at, created_at)
    WHERE published_at IS NULL;

CREATE INDEX idx_fraud_flags_user_created_at_desc
    ON fraud_flags (user_id, created_at DESC);

CREATE INDEX idx_user_score_materialized_totals_last_event_id
    ON user_score_materialized_totals (last_event_id);

COMMIT;
