import db from '../database/db';
import { Score, ScoreWithUser } from '../types/score';
import { v4 as uuidv4 } from 'uuid';

export class ScoreModel {
  static create(userId: string, initialScore: number = 0): Score {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO scores (id, user_id, score)
      VALUES (?, ?, ?)
    `);

    stmt.run(id, userId, initialScore);

    return this.findByUserId(userId)!;
  }

  static findByUserId(userId: string): Score | null {
    const stmt = db.prepare('SELECT * FROM scores WHERE user_id = ?');
    const row = stmt.get(userId) as any;

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      score: row.score,
      updatedAt: row.updated_at,
    };
  }

  static updateScore(userId: string, increment: number): Score {
    const currentScore = this.findByUserId(userId);

    if (!currentScore) {
      return this.create(userId, increment);
    }

    const newScore = currentScore.score + increment;
    const stmt = db.prepare(`
      UPDATE scores 
      SET score = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);

    stmt.run(newScore, userId);

    return this.findByUserId(userId)!;
  }

  static getTopScores(limit: number = 10): ScoreWithUser[] {
    const stmt = db.prepare(`
      SELECT 
        s.user_id as userId,
        u.username as username,
        s.score as score,
        s.updated_at as updatedAt,
        ROW_NUMBER() OVER (ORDER BY s.score DESC) as rank
      FROM scores s
      INNER JOIN users u ON s.user_id = u.id
      ORDER BY s.score DESC
      LIMIT ?
    `);

    const rows = stmt.all(limit) as any[];

    return rows.map((row) => ({
      userId: row.userId,
      username: row.username,
      score: row.score,
      rank: row.rank,
      updatedAt: row.updatedAt,
    }));
  }

  static getUserRank(userId: string): number | null {
    const stmt = db.prepare(`
      SELECT 
        ROW_NUMBER() OVER (ORDER BY score DESC) as rank
      FROM scores
      WHERE user_id = ?
    `);

    const row = stmt.get(userId) as any;
    return row ? row.rank : null;
  }

  static getTotalPlayers(): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM scores');
    const row = stmt.get() as any;
    return row.count;
  }

  static getUserScoreWithRank(userId: string): ScoreWithUser | null {
    const score = this.findByUserId(userId);
    if (!score) return null;

    const userStmt = db.prepare('SELECT username FROM users WHERE id = ?');
    const userRow = userStmt.get(userId) as any;

    if (!userRow) return null;

    const rank = this.getUserRank(userId);
    if (rank === null) return null;

    return {
      userId: score.userId,
      username: userRow.username,
      score: score.score,
      rank: rank,
      updatedAt: score.updatedAt,
    };
  }
}
