import { Router } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/auth';
import { broadcastScores } from '../websocket/scoreboard';

const router = Router();

// Get top 10 scores
router.get('/', (req, res) => {
    try {
        const scores = db.prepare('SELECT username, score FROM scores ORDER BY score DESC LIMIT 10').all();
        res.json(scores);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Get current authenticated user's score
router.get('/me', requireAuth, (req, res) => {
    const user = (req as any).user;
    res.json({ username: user.username, score: user.score });
});


// Increment score manually (Problem 6 specifically asked for action completion)
router.post('/action', requireAuth, (req, res) => {
    const user = (req as any).user;
    try {
        db.prepare('UPDATE scores SET score = score + 1 WHERE id = ?').run(user.id);
        broadcastScores();
        res.json({ success: true, message: 'Score incremented' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Create a session for a new user
router.post('/session', (req, res) => {
    try {
        // Generate random username and token
        const username = 'User' + Math.floor(Math.random() * 10000);
        const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const score = 40;
        // As user requested, start with 30 points
        db.prepare('INSERT INTO scores (username, sessionToken, score) VALUES (?, ?, ?)').run(username, token,score);
        
        res.json({ username, token ,score});  // score is server-side only
        broadcastScores();
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
