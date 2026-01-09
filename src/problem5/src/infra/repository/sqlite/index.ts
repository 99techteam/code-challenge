import Database from "better-sqlite3";
import {
  RepositoryInterface,
  RepositoryInternalError,
  NotFoundError,
} from '../../../domain/interface';
import * as Logger from '../../../utils/Logger';
import * as schema from '../../../domain/schema';
import { randomUUID } from "crypto";
import path from "path";

const dbPath = path.join(__dirname, '../../../db/data.db');

export class SqliteRepository implements RepositoryInterface {
  private db: Database.Database;

  constructor(dbFile = dbPath) {
    this.db = new Database(dbFile);
    this.initialize();
  }

  private initialize(): void {
    this.db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          _id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          emailVerified INTEGER NOT NULL,
          name TEXT NOT NULL,
          picture TEXT,
          phone TEXT,
          city TEXT,
          address TEXT,
          age INTEGER,
          gender TEXT,
          fatherName TEXT,
          joinDate TEXT,
          userRole INTEGER,
          isBlock INTEGER,
          updatedAt TEXT
        )
      `).run();
  }

  async getAllUsers(
    filters: schema.UserFilters = {},
    pagination: schema.PaginationOptions = { page: 1, limit: 10 }
  ): Promise<{ data: schema.IStoredUser[]; total: number }> {

    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = [];

    if (filters.email) {
      whereClauses.push(`email LIKE ?`);
      params.push(`%${filters.email}%`);
    }

    if (filters.name) {
      whereClauses.push(`name LIKE ?`);
      params.push(`%${filters.name}%`);
    }

    if (filters.city) {
      whereClauses.push(`city = ?`);
      params.push(filters.city);
    }

    if (filters.gender) {
      whereClauses.push(`gender = ?`);
      params.push(filters.gender);
    }

    if (filters.userRole !== undefined) {
      whereClauses.push(`userRole = ?`);
      params.push(filters.userRole);
    }

    if (filters.isBlock !== undefined) {
      whereClauses.push(`isBlock = ?`);
      params.push(filters.isBlock);
    }

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const totalRow = this.db
      .prepare(`SELECT COUNT(*) as count FROM users ${whereSQL}`)
      .get(...params) as { count: number };

    const rows = this.db
      .prepare(`
        SELECT * FROM users
        ${whereSQL}
        ORDER BY joinDate DESC
        LIMIT ? OFFSET ?
      `)
      .all(...params, limit, offset);

    return {
      data: rows.map(this.mapUser),
      total: totalRow.count
    };
  }

  async getUserById(id: string): Promise<schema.IStoredUser> {
    const row = this.db
      .prepare(`SELECT * FROM users WHERE _id = ?`)
      .get(id);

    if (!row) {
      Logger.instance.error({ module: 'getUserById', "error": "User not found with id" });
      throw new Error("User not found");
    }
    return this.mapUser(row);
  }

  async getUserByEmail(email: string): Promise<schema.IStoredUser> {
    const row = this.db
      .prepare(`SELECT * FROM users WHERE email = ?`)
      .get(email);

    if (!row) throw new Error("User not found");
    return this.mapUser(row);
  }

  async getUserPasswordByEmail(email: string): Promise<schema.IStoredUser> {

    const row = this.db
      .prepare(`SELECT * FROM users WHERE email = ?`)
      .get(email);

    if (!row) {
      Logger.instance.error({ module: 'getUserPasswordByEmail', "error": "User not found with email" });
      throw new Error("User not found");
    }
    return this.mapUser(row);
  }

  async storeUserData(payload: schema.IUserData): Promise<string | null> {
    try {
      const _id = randomUUID();
      this.db.prepare(`
          INSERT INTO users (
            _id, email, password, emailVerified, name, picture,
            phone, city, address, age, gender, fatherName,
            joinDate, userRole, isBlock, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
        _id,
        payload.email,
        payload.password,
        payload.emailVerified ? 1 : 0,
        payload.name,
        payload.picture,
        payload.phone,
        payload.city,
        payload.address,
        payload.age,
        payload.gender,
        payload.fatherName,
        payload.joinDate,
        payload.userRole,
        payload.isBlock ? 1 : 0,
        payload.updatedAt ?? null
      );

      return _id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      Logger.instance.error({ module: 'storeUserData', err });
      if (err.code === "SQLITE_CONSTRAINT") {
        return null;
      }
      throw err;
    }
  }

  async updateUserById(
    id: string,
    payload: Partial<schema.IUserData>
  ): Promise<schema.IStoredUser> {
    try {
      const fields: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const values: any[] = [];

      for (const [key, value] of Object.entries(payload)) {
        if (value === undefined) continue;

        if (key === 'emailVerified' || key === 'isBlock') {
          fields.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) {
        throw new RepositoryInternalError(
          new Error('No fields provided for update')
        );
      }

      fields.push(`updatedAt = ?`);
      values.push(new Date().toISOString());

      values.push(id);
      const result = this.db.prepare(`
        UPDATE users
        SET ${fields.join(', ')}
        WHERE _id = ?
      `).run(...values);

      if (result.changes === 0) {
        throw new NotFoundError('User not found');
      }

      return this.getUserById(id);
    } catch (err) {
      Logger.instance.error({ module: 'updateUserById', err });
      throw err;
    }
  }

  async deleteUserById(id: string): Promise<void> {
    try {
      const result = this.db
        .prepare(`DELETE FROM users WHERE _id = ?`)
        .run(id);

      if (result.changes === 0) {
        throw new NotFoundError('User not found');
      }
    } catch (err) {
      Logger.instance.error({ module: 'deleteUserById', err });
      throw err;
    }
  }

  async close(): Promise<void> {
    this.db.close();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapUser(row: any): schema.IStoredUser {
    return {
      _id: row._id,
      email: row.email,
      password: row.password,
      emailVerified: Boolean(row.emailVerified),
      name: row.name,
      picture: row.picture,
      phone: row.phone,
      city: row.city,
      address: row.address,
      age: row.age,
      gender: row.gender,
      fatherName: row.fatherName,
      joinDate: row.joinDate,
      userRole: row.userRole,
      isBlock: Boolean(row.isBlock),
      updatedAt: row.updatedAt
    };
  }
}
