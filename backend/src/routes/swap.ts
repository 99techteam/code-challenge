import { Router } from 'express';
import db from '../db';
import { broadcastScores } from '../websocket/scoreboard';

const router = Router();

router.post('/', (req, res) => {
    const { fromCoin, toCoin, amount, sessionToken } = req.body;

    if (!fromCoin || !toCoin || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Delay to simulate network / transaction
    setTimeout(() => {
        try {
            let newScore: number | null = null;

            // Increment score if a valid session token is provided
            if (sessionToken) {
                const result = db.prepare('UPDATE scores SET score = score + 1 WHERE sessionToken = ?').run(sessionToken);
                if (result.changes > 0) {
                    const row = db.prepare('SELECT score FROM scores WHERE sessionToken = ?').get(sessionToken) as { score: number } | undefined;
                    newScore = row?.score ?? null;
                    broadcastScores();
                }
            }

            res.json({
                success: true,
                message: `Swapped ${amount} ${fromCoin} to ${toCoin}`,
                transactionId: Math.random().toString(36).substring(7),
                newScore  // always return the fresh score so the frontend doesn't need localStorage
            });
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    }, 1500); // 1.5s delay
});

export default router;
