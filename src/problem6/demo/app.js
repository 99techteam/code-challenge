const express = require('express');
const cors = require('cors');
const { PlayerStore } = require('./lib/store');
const { signSession, decodeSession, requireAuth } = require('./lib/auth');
const { createRateLimiter } = require('./lib/rateLimiter');
const { buildLeaderboard } = require('./lib/leaderboard');
const { issueActionToken, completeAction } = require('./lib/actions');
const { DEMO_PASSWORD, RATE_LIMIT } = require('./lib/config');

function createApp(options = {}) {
  const store = options.store || PlayerStore.createSeed(options.password ?? DEMO_PASSWORD);
  const allowRate = options.rateLimiter || createRateLimiter(RATE_LIMIT);
  const bus = options.bus || { emit: () => {} };

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Scoreboard API Demo Server',
      version: '1.0.0',
      endpoints: {
        login: 'POST /auth/login',
        leaderboard: 'GET /api/leaderboard',
        requestAction: 'POST /api/actions/request',
        completeAction: 'POST /api/actions/complete',
        myScore: 'GET /api/users/me/score',
        websocket: 'WS /socket.io'
      },
      demoUsers: store.allPlayers().map((p) => ({
        username: p.username,
        password: options.password ?? DEMO_PASSWORD
      }))
    });
  });

  app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const player = store.findByUsername(username);

    if (!player || player.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      data: {
        token: signSession(player),
        user: { id: player.id, username: player.username, score: player.score }
      }
    });
  });

  app.get('/api/leaderboard', (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    res.json({
      success: true,
      data: {
        leaderboard: buildLeaderboard(store, limit),
        lastUpdated: new Date().toISOString()
      }
    });
  });

  app.post('/api/actions/request', requireAuth, (req, res) => {
    const actionType = req.body.actionType || 'COMPLETE_LEVEL';
    const payload = issueActionToken(store, req.user.userId, actionType);
    res.json({ success: true, data: payload });
  });

  app.post('/api/actions/complete', requireAuth, (req, res) => {
    const { actionToken, actionId, proof } = req.body;
    const outcome = completeAction(store, decodeSession, {
      userId: req.user.userId,
      actionToken,
      actionId,
      proof,
      allowRate,
      emit: (event, payload) => bus.emit(event, payload)
    });
    res.status(outcome.status).json(outcome.body);
  });

  app.get('/api/users/me/score', requireAuth, (req, res) => {
    const player = store.getById(req.user.userId);
    const board = buildLeaderboard(store, 100);
    const rank = board.findIndex((row) => row.userId === player.id) + 1;

    res.json({
      success: true,
      data: {
        userId: player.id,
        username: player.username,
        score: player.score,
        rank: rank || board.length + 1,
        totalActions: player.totalActions
      }
    });
  });

  return { app, store, bus };
}

module.exports = { createApp };
