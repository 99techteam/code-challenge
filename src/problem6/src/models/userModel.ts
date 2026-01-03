import db from '../database/db';
import { User, UserPublic } from '../types/user';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  static create(userData: {
    username: string;
    email: string;
    passwordHash: string;
  }): User {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password_hash)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, userData.username, userData.email, userData.passwordHash);

    return this.findById(id)!;
  }

  static findById(id: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static findByUsername(username: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const row = stmt.get(username) as any;

    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static findByEmail(email: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email) as any;

    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static toPublic(user: User): UserPublic {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}

