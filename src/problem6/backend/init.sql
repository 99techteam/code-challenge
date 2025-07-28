-- Database initialization script for live scoreboard system

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_score ON users(score DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create user_actions table for audit trail
CREATE TABLE IF NOT EXISTS user_actions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    operand1 INTEGER,
    operand2 INTEGER,
    result INTEGER,
    points_earned INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for user actions
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
-- Password: 123456
INSERT INTO users (email, password_hash, username, score) VALUES
('admin@example.com', '$2a$10$izrrL8qxmq.Z5b6kSAqAFuUSevXeoAFjuK40jaDh3xmYjCmMTGTOK', 'admin', 10),
('user1@example.com', '$2a$10$izrrL8qxmq.Z5b6kSAqAFuUSevXeoAFjuK40jaDh3xmYjCmMTGTOK', 'player1', 15),
('user2@example.com', '$2a$10$izrrL8qxmq.Z5b6kSAqAFuUSevXeoAFjuK40jaDh3xmYjCmMTGTOK', 'player2', 30),
('user3@example.com', '$2a$10$izrrL8qxmq.Z5b6kSAqAFuUSevXeoAFjuK40jaDh3xmYjCmMTGTOK', 'player3', 45),
('user4@example.com', '$2a$10$izrrL8qxmq.Z5b6kSAqAFuUSevXeoAFjuK40jaDh3xmYjCmMTGTOK', 'player4', 60)
('user5@example.com', '$2a$10$izrrL8qxmq.Z5b6kSAqAFuUSevXeoAFjuK40jaDh3xmYjCmMTGTOK', 'player5', 20)
ON CONFLICT (email) DO NOTHING;
