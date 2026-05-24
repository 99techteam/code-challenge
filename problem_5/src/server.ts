import { createApp } from './app';
import { config } from './config';
import { prisma } from './prisma';

const app = createApp();

async function start(): Promise<void> {
  await prisma.$connect();
  app.listen(config.port, () => {
    // Simple startup log for local development.
    console.log(`Resource service listening on port ${config.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
