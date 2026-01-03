import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel';
import { RegisterRequest, LoginRequest, LoginResponse } from '../types/user';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, email }: RegisterRequest = req.body;

      const existingUser = UserModel.findByUsername(username);
      if (existingUser) {
        res.status(409).json({ error: 'Username already exists' });
        return;
      }

      const existingEmail = UserModel.findByEmail(email);
      if (existingEmail) {
        res.status(409).json({ error: 'Email already exists' });
        return;
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = UserModel.create({
        username,
        email,
        passwordHash,
      });

      const { ScoreModel } = await import('../models/scoreModel');
      ScoreModel.create(user.id, 0);

      res.status(201).json({
        message: 'User registered successfully',
        userId: user.id,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password }: LoginRequest = req.body;

      const user = UserModel.findByUsername(username);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET is not set in environment variables');
        res.status(500).json({ error: 'Server configuration error' });
        return;
      }

      const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
        },
        jwtSecret,
        { expiresIn }
      );

      const response: LoginResponse = {
        token,
        user: UserModel.toPublic(user),
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
