import { Router } from 'express';
import db from '../db';

const router = Router();

// Get all coins
router.get('/', (req, res) => {
    const { blockchain, search, minPrice, maxPrice } = req.query;
    let query = 'SELECT * FROM coins WHERE 1=1';
    const params: any[] = [];

    if (blockchain) {
        query += ' AND blockchain = ?';
        params.push(blockchain);
    }
    if (search) {
        query += ' AND (currency LIKE ? OR blockchain LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    if (minPrice) {
        query += ' AND price >= ?';
        params.push(minPrice);
    }
    if (maxPrice) {
        query += ' AND price <= ?';
        params.push(maxPrice);
    }

    try {
        const coins = db.prepare(query).all(params);
        res.json(coins);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Get single coin
router.get('/:id', (req, res) => {
    try {
        const coin = db.prepare('SELECT * FROM coins WHERE id = ?').get(req.params.id);
        if (coin) {
            res.json(coin);
        } else {
            res.status(404).json({ error: 'Coin not found' });
        }
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Create coin
router.post('/', (req, res) => {
    const { currency, blockchain, price, date, iconFilename } = req.body;
    try {
        const result = db.prepare('INSERT INTO coins (currency, blockchain, price, date, iconFilename) VALUES (?, ?, ?, ?, ?)').run(currency, blockchain, price, date, iconFilename);
        res.status(201).json({ id: result.lastInsertRowid, ...req.body });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Update coin
router.put('/:id', (req, res) => {
    const { currency, blockchain, price, date, iconFilename } = req.body;
    try {
        const result = db.prepare('UPDATE coins SET currency = ?, blockchain = ?, price = ?, date = ?, iconFilename = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(currency, blockchain, price, date, iconFilename, req.params.id);
        if (result.changes > 0) {
            res.json({ id: req.params.id, ...req.body });
        } else {
            res.status(404).json({ error: 'Coin not found' });
        }
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Delete coin
router.delete('/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM coins WHERE id = ?').run(req.params.id);
        if (result.changes > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Coin not found' });
        }
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
