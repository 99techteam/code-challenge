const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, SCORING, ACTION_TOKEN_TTL_SEC, COMPLETION_TIME } = require('./config');
const { buildLeaderboard, findRank } = require('./leaderboard');

function issueActionToken(store, userId, actionType) {
  const actionId = crypto.randomBytes(16).toString('hex');
  const actionToken = jwt.sign(
    {
      actionId,
      userId,
      actionType,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(8).toString('hex')
    },
    JWT_SECRET,
    { expiresIn: `${ACTION_TOKEN_TTL_SEC}s` }
  );

  store.saveAction(actionId, {
    token: actionToken,
    userId,
    used: false,
    createdAt: Date.now()
  });

  return {
    actionToken,
    actionId,
    expiresAt: new Date(Date.now() + ACTION_TOKEN_TTL_SEC * 1000).toISOString()
  };
}

function completeAction(store, decodeSession, { userId, actionToken, actionId, proof, allowRate, emit }) {
  const decoded = decodeSession(actionToken);
  if (!decoded || decoded.userId !== userId) {
    return { status: 400, body: { success: false, error: 'Invalid action token' } };
  }

  const stored = store.getAction(actionId);
  if (!stored || stored.used) {
    return { status: 400, body: { success: false, error: 'Token already used or expired' } };
  }

  if (!allowRate(userId)) {
    return {
      status: 429,
      body: { success: false, error: 'Rate limit exceeded', retryAfter: 60 }
    };
  }

  const elapsed = proof?.completionTime ?? 10_000;
  if (elapsed < COMPLETION_TIME.minMs || elapsed > COMPLETION_TIME.maxMs) {
    return { status: 400, body: { success: false, error: 'Suspicious completion time' } };
  }

  store.markActionUsed(actionId);

  const player = store.getById(userId);
  const increment = SCORING.levelComplete;
  const previousScore = player.score;
  player.score += increment;
  player.totalActions += 1;

  const newRank = findRank(store, userId);

  emit('board:changed', {
    leaderboard: buildLeaderboard(store, 10),
    updatedAt: new Date().toISOString()
  });

  emit('player:scored', {
    userId,
    oldScore: previousScore,
    newScore: player.score,
    increment,
    newRank
  });

  return {
    status: 200,
    body: {
      success: true,
      data: {
        scoreIncrement: increment,
        newScore: player.score,
        rank: newRank,
        message: 'Score updated successfully'
      }
    }
  };
}

module.exports = { issueActionToken, completeAction };
