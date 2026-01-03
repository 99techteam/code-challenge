import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import scoreRoutes from './routes/scoreRoutes';
import scoreboardRoutes from './routes/scoreboardRoutes';
import { initializeWebSocket } from './websocket/websocketServer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('⚠️  WARNING: JWT_SECRET is not set in environment variables');
  console.error('   Please set JWT_SECRET in .env file or environment');
  console.error(
    '   Using a default secret for development (NOT SECURE FOR PRODUCTION)'
  );
  process.env.JWT_SECRET = 'default-dev-secret-change-in-production';
}

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..')));

app.get('/test', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../test-websocket.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/scoreboard', scoreboardRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const server = http.createServer(app);

initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
  console.log(
    `🔌 WebSocket server available at ws://localhost:${PORT}/ws/scoreboard`
  );
  console.log(`💚 Health check available at http://localhost:${PORT}/health`);
  console.log(
    `🧪 WebSocket test page available at http://localhost:${PORT}/test`
  );
});
