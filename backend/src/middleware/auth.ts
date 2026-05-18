import { Request, Response, NextFunction } from 'express';
import db from '../db';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: missing token' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const user = db.prepare('SELECT id, username, score FROM scores WHERE sessionToken = ?').get(token);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: invalid token' });
        }
        
        // Attach user info to request
        (req as any).user = user;
        next();
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
