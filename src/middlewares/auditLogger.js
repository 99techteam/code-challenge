// auditLogger.js
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'audit.log');

function logEvent(event, userId, ip) {
  const entry = JSON.stringify({
    event,
    userId,
    ip,
    timestamp: new Date().toISOString()
  }) + '\n';

  fs.appendFileSync(logFile, entry);
}

export default logEvent;