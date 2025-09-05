/**
 * User service - Business logic layer
 */

import { Database } from '../config/database';
import { User, CreateUserRequest, UpdateUserRequest, UserFilters, PaginatedResponse, PaginationParams } from '../types';

export class UserService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Create a new user
   */
  public async createUser(userData: CreateUserRequest): Promise<User> {
    const { name, email, age, role, isActive = true } = userData;

    // Check if email already exists
    const existingUser = await this.db.get<User>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Insert new user
    const result = await this.db.run(
      `INSERT INTO users (name, email, age, role, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [name, email, age, role, isActive ? 1 : 0]
    );

    // Fetch and return the created user
    const newUser = await this.db.get<User>(
      'SELECT * FROM users WHERE id = ?',
      [result.lastID]
    );

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    return newUser;
  }

  /**
   * Get all users with filtering and pagination
   */
  public async getUsers(
    filters: UserFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<User>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'asc'
    } = pagination;

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    if (filters.name) {
      whereConditions.push('name LIKE ?');
      queryParams.push(`%${filters.name}%`);
    }

    if (filters.email) {
      whereConditions.push('email LIKE ?');
      queryParams.push(`%${filters.email}%`);
    }

    if (filters.role) {
      whereConditions.push('role = ?');
      queryParams.push(filters.role);
    }

    if (filters.isActive !== undefined) {
      whereConditions.push('isActive = ?');
      queryParams.push(filters.isActive ? 1 : 0);
    }

    if (filters.minAge) {
      whereConditions.push('age >= ?');
      queryParams.push(filters.minAge);
    }

    if (filters.maxAge) {
      whereConditions.push('age <= ?');
      queryParams.push(filters.maxAge);
    }

    if (filters.createdAfter) {
      whereConditions.push('createdAt >= ?');
      queryParams.push(filters.createdAfter);
    }

    if (filters.createdBefore) {
      whereConditions.push('createdAt <= ?');
      queryParams.push(filters.createdBefore);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await this.db.get<{ total: number }>(countQuery, queryParams);
    const total = countResult?.total || 0;

    // Get users with pagination
    const usersQuery = `
      SELECT * FROM users 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    const users = await this.db.query<User>(
      usersQuery,
      [...queryParams, limit, offset]
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get user by ID
   */
  public async getUserById(id: number): Promise<User | null> {
    const user = await this.db.get<User>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    return user || null;
  }

  /**
   * Update user by ID
   */
  public async updateUser(id: number, updateData: UpdateUserRequest): Promise<User | null> {
    // Check if user exists
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      return null;
    }

    // Check if email is being updated and if it already exists
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.db.get<User>(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [updateData.email, id]
      );

      if (emailExists) {
        throw new Error('User with this email already exists');
      }
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateParams: any[] = [];

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        if (key === 'isActive') {
          updateParams.push(value ? 1 : 0);
        } else {
          updateParams.push(value);
        }
      }
    });

    if (updateFields.length === 0) {
      return existingUser; // No fields to update
    }

    updateFields.push('updatedAt = CURRENT_TIMESTAMP');
    updateParams.push(id);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await this.db.run(updateQuery, updateParams);

    // Return updated user
    const updatedUser = await this.getUserById(id);
    return updatedUser;
  }

  /**
   * Delete user by ID
   */
  public async deleteUser(id: number): Promise<boolean> {
    const result = await this.db.run(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    return result.changes > 0;
  }

  /**
   * Get user statistics
   */
  public async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  }> {
    const totalResult = await this.db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM users'
    );

    const activeResult = await this.db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM users WHERE isActive = 1'
    );

    const roleStats = await this.db.query<{ role: string; count: number }>(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    const byRole: Record<string, number> = {};
    roleStats.forEach(stat => {
      byRole[stat.role] = stat.count;
    });

    return {
      total: totalResult?.count || 0,
      active: activeResult?.count || 0,
      inactive: (totalResult?.count || 0) - (activeResult?.count || 0),
      byRole,
    };
  }
}
