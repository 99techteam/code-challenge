import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { ScoreModel } from '../models/scoreModel';
import { WebSocketMessage } from '../types/score';

let wss: WebSocketServer | null = null;

export const initializeWebSocket = (server: Server): void => {
  wss = new WebSocketServer({ server, path: '/ws/scoreboard' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket client connected');

    sendScoreboardUpdate(ws);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('WebSocket server initialized on /ws/scoreboard');
};

export const broadcastScoreboardUpdate = (): void => {
  if (!wss) {
    console.warn('WebSocket server not initialized');
    return;
  }

  const topScores = ScoreModel.getTopScores(10);
  const message: WebSocketMessage = {
    type: 'scoreboard_update',
    data: {
      scores: topScores,
      updatedAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  const messageString = JSON.stringify(message);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });

  console.log(`Broadcasted scoreboard update to ${wss.clients.size} clients`);
};

const sendScoreboardUpdate = (ws: WebSocket): void => {
  const topScores = ScoreModel.getTopScores(10);
  const message: WebSocketMessage = {
    type: 'connection_established',
    data: {
      scores: topScores,
      updatedAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
};
