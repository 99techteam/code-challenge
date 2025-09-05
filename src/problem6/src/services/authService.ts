/**
 * Authentication service for user management and JWT handling
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Database } from "../config/database";
import { User, CreateUserRequest, LoginRequest, AuthResponse } from "../types";
import { serverConfig } from "../config";

export class AuthService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Create a new user
   */
  public async createUser(userData: CreateUserRequest): Promise<AuthResponse> {
    const { username, email, password } = userData;

    // Check if user already exists
    const existingUser = await this.db.get<User>(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existingUser) {
      throw new Error("User with this email or username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      serverConfig.bcryptRounds
    );

    // Create user
    const userId = uuidv4();
    await this.db.run(
      `INSERT INTO users (id, username, email, password, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [userId, username, email, hashedPassword]
    );

    // Generate JWT token
    const token = this.generateToken(userId, username, email);

    return {
      token,
      user: {
        id: userId,
        username,
        email,
      },
    };
  }

  /**
   * Authenticate user login
   */
  public async login(loginData: LoginRequest): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Find user by email
    const user = await this.db.get<User>(
      "SELECT * FROM users WHERE email = ? AND isActive = 1",
      [email]
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.username, user.email);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  /**
   * Verify JWT token
   */
  public verifyToken(token: string): {
    id: string;
    username: string;
    email: string;
  } {
    try {
      const decoded = jwt.verify(token, serverConfig.jwtSecret) as any;
      return {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
      };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  /**
   * Get user by ID
   */
  public async getUserById(id: string): Promise<User | null> {
    const user = await this.db.get<User>(
      "SELECT * FROM users WHERE id = ? AND isActive = 1",
      [id]
    );

    return user || null;
  }

  /**
   * Generate JWT token
   */
  private generateToken(id: string, username: string, email: string): string {
    return jwt.sign({ id, username, email }, serverConfig.jwtSecret, {
      expiresIn: serverConfig.jwtExpiresIn,
    });
  }

  /**
   * Update user last activity
   */
  public async updateUserActivity(userId: string): Promise<void> {
    await this.db.run(
      "UPDATE users SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [userId]
    );
  }
}
