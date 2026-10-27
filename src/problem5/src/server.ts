import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createApp } from './app.js';
import { TaskStore } from './db.js';

const port = Number(process.env.PORT ?? '3000');
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be a valid port number');
const path = resolve(process.env.DATABASE_PATH ?? './data/tasks.sqlite');
mkdirSync(dirname(path), { recursive: true });
const store = new TaskStore(path);
const server = createApp(store).listen(port, () => console.log(`Task API listening on http://localhost:${port}`));
function shutdown() { server.close(() => { store.close(); process.exit(0); }); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
