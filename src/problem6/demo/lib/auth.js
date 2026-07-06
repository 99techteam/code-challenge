const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config');

function signSession(player) {
  return jwt.sign({ userId: player.id, username: player.username }, JWT_SECRET, { expiresIn: '1h' });
}

function decodeSession(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const payload = decodeSession(header.slice(7));
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  req.user = payload;
  next();
}

module.exports = { signSession, decodeSession, requireAuth };
