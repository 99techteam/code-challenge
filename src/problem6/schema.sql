-- Sample SQL schema for a simple leaderboard system

-- Users table: stores user info and authentication data
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Scores table: stores the current score for each user
CREATE TABLE scores (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Score events: audit log for score changes (for recovery, analytics, replay)
CREATE TABLE score_events (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delta INTEGER NOT NULL, -- e.g., +1 for increment
    event_type VARCHAR(32) NOT NULL, -- e.g., 'increment', 'admin_adjust'
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Optional: leaderboard snapshots for recovery to redis
CREATE TABLE leaderboard_snapshots (
    id BIGSERIAL PRIMARY KEY,
    snapshot_time TIMESTAMP NOT NULL DEFAULT NOW(),
    data JSONB NOT NULL -- stores top N users and scores as JSON
);