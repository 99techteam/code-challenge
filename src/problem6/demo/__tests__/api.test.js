/**
 * Unit Tests for Scoreboard API Demo
 * Tests all API endpoints and core functionality
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

// Note: Since server.js exports the app, we'd need to modify it slightly
// For this demo, we'll test against a running server
const API_URL = 'http://localhost:3000';

describe('Scoreboard API Tests', () => {
  let authToken;
  let testUserId;

  // Test data
  const testUser = {
    username: 'Alice',
    password: 'demo123'
  };

  describe('Health Check', () => {
    it('should return server information', async () => {
      const response = await request(API_URL).get('/');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Scoreboard API Demo');
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.demoUsers).toBeDefined();
      expect(response.body.demoUsers.length).toBe(10);
    });
  });

  describe('Authentication', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(API_URL)
        .post('/auth/login')
        .send(testUser);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.username).toBe(testUser.username);

      // Save token for subsequent tests
      authToken = response.body.data.token;
      testUserId = response.body.data.user.id;
    });

    it('should fail login with invalid username', async () => {
      const response = await request(API_URL)
        .post('/auth/login')
        .send({
          username: 'InvalidUser',
          password: 'demo123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should fail login with invalid password', async () => {
      const response = await request(API_URL)
        .post('/auth/login')
        .send({
          username: 'Alice',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return a valid JWT token', async () => {
      const response = await request(API_URL)
        .post('/auth/login')
        .send(testUser);

      const token = response.body.data.token;
      const decoded = jwt.decode(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBeDefined();
      expect(decoded.username).toBe(testUser.username);
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('Leaderboard', () => {
    it('should get leaderboard without authentication', async () => {
      const response = await request(API_URL).get('/api/leaderboard');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.leaderboard).toBeDefined();
      expect(Array.isArray(response.body.data.leaderboard)).toBe(true);
      expect(response.body.data.leaderboard.length).toBeLessThanOrEqual(10);
    });

    it('should return top 10 users by default', async () => {
      const response = await request(API_URL).get('/api/leaderboard');

      const leaderboard = response.body.data.leaderboard;
      expect(leaderboard.length).toBeLessThanOrEqual(10);
    });

    it('should return users sorted by score descending', async () => {
      const response = await request(API_URL).get('/api/leaderboard');

      const leaderboard = response.body.data.leaderboard;
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].score).toBeGreaterThanOrEqual(leaderboard[i + 1].score);
      }
    });

    it('should include rank, username, and score for each user', async () => {
      const response = await request(API_URL).get('/api/leaderboard');

      const firstUser = response.body.data.leaderboard[0];
      expect(firstUser.rank).toBe(1);
      expect(firstUser.userId).toBeDefined();
      expect(firstUser.username).toBeDefined();
      expect(firstUser.score).toBeDefined();
      expect(firstUser.updatedAt).toBeDefined();
    });

    it('should accept custom limit parameter', async () => {
      const response = await request(API_URL).get('/api/leaderboard?limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.leaderboard.length).toBeLessThanOrEqual(5);
    });
  });

  describe('User Score', () => {
    beforeAll(async () => {
      // Ensure we have a valid token
      const response = await request(API_URL)
        .post('/auth/login')
        .send(testUser);
      authToken = response.body.data.token;
    });

    it('should get current user score with authentication', async () => {
      const response = await request(API_URL)
        .get('/api/users/me/score')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.username).toBe(testUser.username);
      expect(response.body.data.score).toBeDefined();
      expect(response.body.data.rank).toBeDefined();
      expect(response.body.data.totalActions).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const response = await request(API_URL).get('/api/users/me/score');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should fail with invalid token', async () => {
      const response = await request(API_URL)
        .get('/api/users/me/score')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Action Token System', () => {
    beforeAll(async () => {
      const response = await request(API_URL)
        .post('/auth/login')
        .send(testUser);
      authToken = response.body.data.token;
    });

    it('should request action token successfully', async () => {
      const response = await request(API_URL)
        .post('/api/actions/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ actionType: 'COMPLETE_LEVEL' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.actionToken).toBeDefined();
      expect(response.body.data.actionId).toBeDefined();
      expect(response.body.data.expiresAt).toBeDefined();
    });

    it('should fail to request token without authentication', async () => {
      const response = await request(API_URL)
        .post('/api/actions/request')
        .send({ actionType: 'COMPLETE_LEVEL' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should generate unique action IDs', async () => {
      const response1 = await request(API_URL)
        .post('/api/actions/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ actionType: 'COMPLETE_LEVEL' });

      const response2 = await request(API_URL)
        .post('/api/actions/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ actionType: 'COMPLETE_LEVEL' });

      expect(response1.body.data.actionId).not.toBe(response2.body.data.actionId);
    });
  });

  describe('Complete Action & Score Update', () => {
    let actionToken;
    let actionId;
    let initialScore;

    beforeEach(async () => {
      // Login
      const loginResponse = await request(API_URL)
        .post('/auth/login')
        .send(testUser);
      authToken = loginResponse.body.data.token;

      // Get initial score
      const scoreResponse = await request(API_URL)
        .get('/api/users/me/score')
        .set('Authorization', `Bearer ${authToken}`);
      initialScore = scoreResponse.body.data.score;

      // Request action token
      const tokenResponse = await request(API_URL)
        .post('/api/actions/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ actionType: 'COMPLETE_LEVEL' });

      actionToken = tokenResponse.body.data.actionToken;
      actionId = tokenResponse.body.data.actionId;
    });

    it('should complete action and update score', async () => {
      const response = await request(API_URL)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          actionToken,
          actionId,
          proof: { completionTime: 5000 }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.scoreIncrement).toBe(100);
      expect(response.body.data.newScore).toBe(initialScore + 100);
      expect(response.body.data.rank).toBeDefined();
    });

    it('should prevent token reuse (replay attack)', async () => {
      // Use token once
      await request(API_URL)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          actionToken,
          actionId,
          proof: { completionTime: 5000 }
        });

      // Try to use same token again
      const response = await request(API_URL)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          actionToken,
          actionId,
          proof: { completionTime: 5000 }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already used');
    });

    it('should reject completion with invalid action token', async () => {
      const response = await request(API_URL)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          actionToken: 'invalid_token',
          actionId,
          proof: { completionTime: 5000 }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject completion time that is too fast', async () => {
      const response = await request(API_URL)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          actionToken,
          actionId,
          proof: { completionTime: 500 } // Less than 1000ms minimum
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Suspicious');
    });

    it('should reject completion time that is too slow', async () => {
      const response = await request(API_URL)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          actionToken,
          actionId,
          proof: { completionTime: 400000 } // More than 300000ms maximum
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Suspicious');
    });
  });

  describe('Rate Limiting', () => {
    let tokens = [];

    beforeAll(async () => {
      // Login and get token
      const response = await request(API_URL)
        .post('/auth/login')
        .send(testUser);
      authToken = response.body.data.token;
    });

    it('should enforce rate limit after 10 actions', async () => {
      // Request and complete 10 actions rapidly
      const promises = [];
      for (let i = 0; i < 11; i++) {
        const promise = (async () => {
          const tokenResponse = await request(API_URL)
            .post('/api/actions/request')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ actionType: 'COMPLETE_LEVEL' });

          if (tokenResponse.status === 200) {
            await request(API_URL)
              .post('/api/actions/complete')
              .set('Authorization', `Bearer ${authToken}`)
              .send({
                actionToken: tokenResponse.body.data.actionToken,
                actionId: tokenResponse.body.data.actionId,
                proof: { completionTime: 2000 }
              });
          }
        })();
        promises.push(promise);
      }

      await Promise.all(promises);

      // 11th attempt should be rate limited
      const tokenResponse = await request(API_URL)
        .post('/api/actions/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ actionType: 'COMPLETE_LEVEL' });

      const response = await request(API_URL)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          actionToken: tokenResponse.body.data.actionToken,
          actionId: tokenResponse.body.data.actionId,
          proof: { completionTime: 2000 }
        });

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Rate limit');
      expect(response.body.retryAfter).toBeDefined();
    }, 30000); // Increase timeout for this test
  });

  describe('Security', () => {
    it('should require authentication for protected endpoints', async () => {
      const endpoints = [
        { method: 'post', path: '/api/actions/request' },
        { method: 'post', path: '/api/actions/complete' },
        { method: 'get', path: '/api/users/me/score' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(API_URL)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      }
    });

    it('should reject malformed JWT tokens', async () => {
      const response = await request(API_URL)
        .get('/api/users/me/score')
        .set('Authorization', 'Bearer malformed.jwt.token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not expose sensitive information in errors', async () => {
      const response = await request(API_URL)
        .post('/auth/login')
        .send({ username: 'test', password: 'wrong' });

      expect(response.body.error).not.toContain('password');
      expect(response.body.error).not.toContain('hash');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain leaderboard consistency after score updates', async () => {
      // Get initial leaderboard
      const initialResponse = await request(API_URL).get('/api/leaderboard');
      const initialLeaderboard = initialResponse.body.data.leaderboard;

      // Login and complete an action
      const loginResponse = await request(API_URL)
        .post('/auth/login')
        .send({ username: 'Bob', password: 'demo123' });
      
      const token = loginResponse.body.data.token;
      
      const tokenResponse = await request(API_URL)
        .post('/api/actions/request')
        .set('Authorization', `Bearer ${token}`)
        .send({ actionType: 'COMPLETE_LEVEL' });

      await request(API_URL)
        .post('/api/actions/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({
          actionToken: tokenResponse.body.data.actionToken,
          actionId: tokenResponse.body.data.actionId,
          proof: { completionTime: 3000 }
        });

      // Get updated leaderboard
      const updatedResponse = await request(API_URL).get('/api/leaderboard');
      const updatedLeaderboard = updatedResponse.body.data.leaderboard;

      // Verify leaderboard is still sorted
      for (let i = 0; i < updatedLeaderboard.length - 1; i++) {
        expect(updatedLeaderboard[i].score).toBeGreaterThanOrEqual(
          updatedLeaderboard[i + 1].score
        );
      }
    });
  });
});

