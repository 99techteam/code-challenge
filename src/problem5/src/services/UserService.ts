/**
 * User service for CRUD operations
 */

import { Database } from "../models/Database";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
} from "../types";

export class UserService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Create a new user
   */
  public async createUser(userData: CreateUserRequest): Promise<User> {
    const { name, email, age } = userData;

    // Check if email already exists
    const existingUser = await this.db.get<User>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const result = await this.db.run(
      "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
      [name, email, age]
    );

    const newUser = await this.db.get<User>(
      "SELECT * FROM users WHERE id = ?",
      [result.lastID]
    );

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    return newUser;
  }

  /**
   * Get all users with filters and pagination
   */
  public async getUsers(filters: UserFilters = {}): Promise<{
    users: User[];
    total: number;
  }> {
    const { name, email, minAge, maxAge, page = 1, limit = 10 } = filters;

    let whereConditions: string[] = [];
    let params: any[] = [];

    if (name) {
      whereConditions.push("name LIKE ?");
      params.push(`%${name}%`);
    }

    if (email) {
      whereConditions.push("email LIKE ?");
      params.push(`%${email}%`);
    }

    if (minAge !== undefined) {
      whereConditions.push("age >= ?");
      params.push(minAge);
    }

    if (maxAge !== undefined) {
      whereConditions.push("age <= ?");
      params.push(maxAge);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Get total count
    const countResult = await this.db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      params
    );
    const total = countResult?.count || 0;

    // Get paginated results
    const offset = (page - 1) * limit;
    const users = await this.db.all<User>(
      `SELECT * FROM users ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { users, total };
  }

  /**
   * Get user by ID
   */
  public async getUserById(id: number): Promise<User | null> {
    const user = await this.db.get<User>("SELECT * FROM users WHERE id = ?", [
      id,
    ]);

    return user || null;
  }

  /**
   * Update user
   */
  public async updateUser(
    id: number,
    userData: UpdateUserRequest
  ): Promise<User | null> {
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      return null;
    }

    // Check if email is being changed and if it already exists
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.db.get<User>(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [userData.email, id]
      );

      if (emailExists) {
        throw new Error("Email already exists");
      }
    }

    const updateFields: string[] = [];
    const params: any[] = [];

    if (userData.name !== undefined) {
      updateFields.push("name = ?");
      params.push(userData.name);
    }

    if (userData.email !== undefined) {
      updateFields.push("email = ?");
      params.push(userData.email);
    }

    if (userData.age !== undefined) {
      updateFields.push("age = ?");
      params.push(userData.age);
    }

    if (updateFields.length === 0) {
      return existingUser;
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    params.push(id);

    await this.db.run(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      params
    );

    const updatedUser = await this.getUserById(id);
    return updatedUser;
  }

  /**
   * Delete user
   */
  public async deleteUser(id: number): Promise<boolean> {
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      return false;
    }

    await this.db.run("DELETE FROM users WHERE id = ?", [id]);
    return true;
  }
}
