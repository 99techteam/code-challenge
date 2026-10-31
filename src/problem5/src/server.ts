import type { Server } from 'node:http';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { app } from './app.js';
import { port, socketPort } from './config.js';
import { database, initializeDatabase } from './database.js';

let socketServer: PGLiteSocketServer | undefined;

async function shutdown(server: Server, signal: NodeJS.Signals): Promise<void> {
  console.log(`${signal} received, shutting down`);
  await new Promise<void>((resolve) => server.close(() => resolve()));
  try {
    await socketServer?.stop();
  } catch (error) {
    console.error('Failed to stop the PGlite socket server', error);
  }
  try {
    await database.close();
  } catch (error) {
    console.error('Failed to close the PGlite database', error);
  }
}

async function start(): Promise<void> {
  await initializeDatabase();

  if (socketPort !== 0) {
    socketServer = new PGLiteSocketServer({
      db: database,
      host: '127.0.0.1',
      port: socketPort,
      maxConnections: 5,
    });
    await socketServer.start();
    console.log(`PGlite PostgreSQL socket listening at 127.0.0.1:${socketPort}`);
  }

  const server = app.listen(port, () => {
    console.log(`Resource API listening at http://localhost:${port}`);
  });
  server.on('error', (error) => {
    console.error('HTTP server error', error);
    process.exitCode = 1;
  });
  process.once('SIGINT', () => void shutdown(server, 'SIGINT'));
  process.once('SIGTERM', () => void shutdown(server, 'SIGTERM'));
}

void start().catch((error: unknown) => {
  console.error('Failed to start Resource API', error);
  process.exitCode = 1;
});
