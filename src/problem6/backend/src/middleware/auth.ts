import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import { JWTPayload, AuthenticatedRequest } from "../types"
import prisma from "../utils/prisma"

// JWT Authentication middleware
const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access token required",
    })
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload

    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        score: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      })
      return
    }

    ;(req as AuthenticatedRequest).user = user
    next()
  } catch (error) {
    console.error("Token verification error:", error)

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token expired",
      })
      return
    }

    res.status(403).json({
      success: false,
      message: "Invalid token",
    })
  }
}

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    ;(req as AuthenticatedRequest).user = null as any
    next()
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        score: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    ;(req as AuthenticatedRequest).user = user || (null as any)
  } catch (error) {
    ;(req as AuthenticatedRequest).user = null as any
  }

  next()
}

// Generate JWT token
const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  } as jwt.SignOptions)
}

// Verify JWT token (utility function)
const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch (error) {
    return null
  }
}

export { authenticateToken, optionalAuth, generateToken, verifyToken }
