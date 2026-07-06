module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'local-dev-key',
  PORT: Number(process.env.PORT) || 3000,
  DEMO_PASSWORD: 'pass123',
  SCORING: { levelComplete: 100 },
  ACTION_TOKEN_TTL_SEC: 300,
  RATE_LIMIT: { windowMs: 60_000, maxActions: 10 },
  COMPLETION_TIME: { minMs: 1000, maxMs: 300_000 }
};
