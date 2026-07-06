const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../app');
const { PlayerStore } = require('../lib/store');
const { createRateLimiter } = require('../lib/rateLimiter');
const { DEMO_PASSWORD, RATE_LIMIT } = require('../lib/config');

function freshApp(overrides = {}) {
  return createApp({
    store: PlayerStore.createSeed(),
    rateLimiter: createRateLimiter(RATE_LIMIT),
    ...overrides
  }).app;
}

describe('Scoreboard API Tests', () => {
  const testUser = { username: 'Minh', password: DEMO_PASSWORD };

  describe('Health Check', () => {
    it('returns server information', async () => {
      const app = freshApp();
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Scoreboard API Demo');
      expect(response.body.demoUsers).toHaveLength(10);
    });
  });

  describe('Authentication', () => {
    it('logs in with valid credentials', async () => {
      const app = freshApp();
      const response = await request(app).post('/auth/login').send(testUser);

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.username).toBe('Minh');
    });

    it('rejects unknown username', async () => {
      const app = freshApp();
      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'Nobody', password: DEMO_PASSWORD });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('rejects wrong password', async () => {
      const app = freshApp();
      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'Minh', password: 'wrong' });

      expect(response.status).toBe(401);
    });

    it('returns a decodable JWT', async () => {
      const app = freshApp();
      const response = await request(app).post('/auth/login').send(testUser);
      const decoded = jwt.decode(response.body.data.token);

      expect(decoded.userId).toBeDefined();
      expect(decoded.username).toBe('Minh');
    });
  });

  describe('Leaderboard', () => {
    it('lists top players without auth', async () => {
      const app = freshApp();
      const response = await request(app).get('/api/leaderboard');

      expect(response.status).toBe(200);
      expect(response.body.data.leaderboard.length).toBeLessThanOrEqual(10);
    });

    it('sorts by score descending', async () => {
      const app = freshApp();
      const response = await request(app).get('/api/leaderboard');
      const rows = response.body.data.leaderboard;

      for (let i = 0; i < rows.length - 1; i++) {
        expect(rows[i].score).toBeGreaterThanOrEqual(rows[i + 1].score);
      }
    });

    it('includes rank and username', async () => {
      const app = freshApp();
      const response = await request(app).get('/api/leaderboard');
      const first = response.body.data.leaderboard[0];

      expect(first.rank).toBe(1);
      expect(first.username).toBeDefined();
      expect(first.score).toBeDefined();
    });

    it('honours limit query param', async () => {
      const app = freshApp();
      const response = await request(app).get('/api/leaderboard?limit=5');

      expect(response.body.data.leaderboard.length).toBeLessThanOrEqual(5);
    });
  });

  describe('User Score', () => {
    it('returns profile when authenticated', async () => {
      const app = freshApp();
      const login = await request(app).post('/auth/login').send(testUser);
      const token = login.body.data.token;

      const response = await request(app)
        .get('/api/users/me/score')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('Minh');
      expect(response.body.data.rank).toBeDefined();
    });

    it('requires auth', async () => {
      const app = freshApp();
      const response = await request(app).get('/api/users/me/score');

      expect(response.status).toBe(401);
    });
  });

  describe('Action tokens', () => {
    let token;

    beforeEach(async () => {
      const app = freshApp();
      const login = await request(app).post('/auth/login').send(testUser);
      token = login.body.data.token;
    });

    it('issues a token when authenticated', async () => {
      const app = freshApp();
      const login = await request(app).post('/auth/login').send(testUser);

      const response = await request(app)
        .post('/api/actions/request')
        .set('Authorization', `Bearer ${login.body.data.token}`)
        .send({ actionType: 'COMPLETE_LEVEL' });

      expect(response.body.data.actionToken).toBeDefined();
      expect(response.body.data.actionId).toBeDefined();
    });

    it('generates unique action IDs', async () => {
      const app = freshApp();
      const login = await request(app).post('/auth/login').send(testUser);
      const auth = login.body.data.token;

      const a = await request(app)
        .post('/api/actions/request')
        .set('Authorization', `Bearer ${auth}`)
        .send({ actionType: 'COMPLETE_LEVEL' });

      const b = await request(app)
        .post('/api/actions/request')
        .set('Authorization', `Bearer ${auth}`)
        .send({ actionType: 'COMPLETE_LEVEL' });

      expect(a.body.data.actionId).not.toBe(b.body.data.actionId);
    });
  });

  describe('Complete action', () => {
    async function loginAndToken(app) {
      const login = await request(app).post('/auth/login').send(testUser);
      const auth = login.body.data.token;
      const tok = await request(app)
        .post('/api/actions/request')
        .set('Authorization', `Bearer ${auth}`)
        .send({ actionType: 'COMPLETE_LEVEL' });
      return { auth, ...tok.body.data };
    }

    it('updates score on valid completion', async () => {
      const app = freshApp();
      const { auth, actionToken, actionId } = await loginAndToken(app);

      const before = await request(app)
        .get('/api/users/me/score')
        .set('Authorization', `Bearer ${auth}`);

      const response = await request(app)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${auth}`)
        .send({ actionToken, actionId, proof: { completionTime: 5000 } });

      expect(response.status).toBe(200);
      expect(response.body.data.newScore).toBe(before.body.data.score + 100);
    });

    it('blocks token reuse', async () => {
      const app = freshApp();
      const { auth, actionToken, actionId } = await loginAndToken(app);
      const payload = { actionToken, actionId, proof: { completionTime: 5000 } };

      await request(app)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${auth}`)
        .send(payload);

      const retry = await request(app)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${auth}`)
        .send(payload);

      expect(retry.status).toBe(400);
      expect(retry.body.error).toContain('already used');
    });

    it('rejects suspicious fast completion', async () => {
      const app = freshApp();
      const { auth, actionToken, actionId } = await loginAndToken(app);

      const response = await request(app)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${auth}`)
        .send({ actionToken, actionId, proof: { completionTime: 500 } });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Suspicious');
    });
  });

  describe('Rate limiting', () => {
    it('returns 429 after max actions in window', async () => {
      const app = createApp({
        store: PlayerStore.createSeed(),
        rateLimiter: createRateLimiter({ windowMs: 60_000, maxActions: 10 })
      }).app;

      const login = await request(app).post('/auth/login').send(testUser);
      const auth = login.body.data.token;

      for (let i = 0; i < 10; i++) {
        const tok = await request(app)
          .post('/api/actions/request')
          .set('Authorization', `Bearer ${auth}`)
          .send({ actionType: 'COMPLETE_LEVEL' });

        await request(app)
          .post('/api/actions/complete')
          .set('Authorization', `Bearer ${auth}`)
          .send({
            actionToken: tok.body.data.actionToken,
            actionId: tok.body.data.actionId,
            proof: { completionTime: 2000 }
          });
      }

      const tok = await request(app)
        .post('/api/actions/request')
        .set('Authorization', `Bearer ${auth}`)
        .send({ actionType: 'COMPLETE_LEVEL' });

      const blocked = await request(app)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${auth}`)
        .send({
          actionToken: tok.body.data.actionToken,
          actionId: tok.body.data.actionId,
          proof: { completionTime: 2000 }
        });

      expect(blocked.status).toBe(429);
      expect(blocked.body.error).toContain('Rate limit');
    }, 30_000);
  });
});
