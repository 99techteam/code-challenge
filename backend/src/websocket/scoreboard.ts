import { Server as WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import db from '../db';

let wss: WebSocketServer;

export const setupWebSocket = (server: HttpServer) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
        console.log('Client connected to WebSocket');
        
        // Send initial scores
        sendScoresToClient(ws);

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
};

const getTopScores = () => {
    return db.prepare('SELECT username, score FROM scores ORDER BY score DESC LIMIT 10').all();
};

const sendScoresToClient = (ws: WebSocket) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'SCORE_UPDATE',
            data: getTopScores()
        }));
    }
};

export const broadcastScores = () => {
    if (!wss) return;
    const scores = getTopScores();
    const payload = JSON.stringify({
        type: 'SCORE_UPDATE',
        data: scores
    });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
};
