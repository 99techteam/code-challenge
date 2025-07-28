import { Request, Response } from "express"
import { AuthenticatedRequest, ValidatedRequest, UserRegistration, UserLogin } from "../types"
import authService from "../services/authService"

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, username }: UserRegistration = (req as ValidatedRequest)
        .validatedData

      const result = await authService.register(email, password, username)

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: result.user,
        token: result.token,
      })
    } catch (error: any) {
      console.error("Register controller error:", error)

      if (error.message.includes("already exists")) {
        res.status(409).json({
          success: false,
          message: error.message,
        })
        return
      }

      res.status(500).json({
        success: false,
        message: "Registration failed. Please try again.",
      })
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: UserLogin = (req as ValidatedRequest).validatedData

      const result = await authService.login(email, password)

      res.status(200).json({
        success: true,
        message: "Login successful",
        user: result.user,
        token: result.token,
      })
    } catch (error: any) {
      console.error("Login controller error:", error)

      if (error.message.includes("Invalid email or password")) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        })
        return
      }

      res.status(500).json({
        success: false,
        message: "Login failed. Please try again.",
      })
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id

      await authService.logout(userId)

      res.status(200).json({ success: true, message: "Logged out successfully" })
    } catch (error: any) {
      console.error("Logout controller error:", error)
      res.status(500).json({
        success: false,
        message: "Logout failed. Please try again.",
      })
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id

      const result = await authService.getUserProfile(userId)

      res.status(200).json({
        success: result.success,
        user: result.data,
      })
    } catch (error: any) {
      console.error("Get profile controller error:", error)

      if (error.message.includes("User not found")) {
        res.status(404).json({
          success: false,
          message: "User not found",
        })
        return
      }

      res.status(500).json({
        success: false,
        message: "Failed to retrieve user profile",
      })
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id

      // Validate current session
      const isValidSession = await authService.validateUserSession(userId)
      if (!isValidSession) {
        res.status(401).json({
          success: false,
          message: "Session expired. Please login again.",
        })
        return
      }

      // Generate a new token
      const tokenResult = await authService.generateToken(userId)

      // Get fresh user data
      const result = await authService.getUserProfile(userId)

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        token: tokenResult.token,
        user: result.data,
      })
    } catch (error: any) {
      console.error("Refresh token controller error:", error)
      res.status(500).json({
        success: false,
        message: "Token refresh failed",
      })
    }
  }
}

export default new AuthController()
