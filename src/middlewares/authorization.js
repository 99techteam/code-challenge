// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import logEvent from '../middlewares/auditLogger.js';
import getClientIp from './getClientIp.js';

function Authorization(req, res, next) {
  const authHeader = req.headers['authorization'];
  const ip = req.ip;
  if (!authHeader) {
    logEvent("unauthorized_access_no_token", null, getClientIp(ip));
    return res.status(401).json({ error: 'You don’t have access to this resource' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userId = decoded.id;

    // Successful authorization
    logEvent("authorized_access", req.userId, getClientIp(ip));

    next();
  } catch (err) {
    logEvent("unauthorized_access_invalid_token", null, getClientIp(ip));
    return res.status(403).json({ error: "Invalid token" });
  }
}

export default Authorization;