import express from "express"
import authController from "../controllers/authController"
import { validate, registerSchema, loginSchema } from "../utils/validation"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// POST /api/auth/register
router.post("/register", validate(registerSchema), authController.register)

// POST /api/auth/login
router.post("/login", validate(loginSchema), authController.login)

// POST /api/auth/logout
router.post("/logout", authenticateToken, authController.logout)

// GET /api/auth/profile
router.get("/profile", authenticateToken, authController.getProfile)

// POST /api/auth/refresh
router.post("/refresh", authenticateToken, authController.refreshToken)

export default router
