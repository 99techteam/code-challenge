import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) {
        return res.status(400).json({ error: 'Missing from or to currency' });
    }

    try {
        const fromCoin = db.prepare('SELECT price FROM coins WHERE currency = ?').get(from) as { price: number };
        const toCoin = db.prepare('SELECT price FROM coins WHERE currency = ?').get(to) as { price: number };

        if (!fromCoin || !toCoin) {
            return res.status(404).json({ error: 'Currency not found' });
        }

        const rate = fromCoin.price / toCoin.price;
        res.json({
            rate,
            fromPrice: fromCoin.price,
            toPrice: toCoin.price
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
