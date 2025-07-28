import express from "express"
import scoreController from "../controllers/scoreController"
import { validate, actionSchema } from "../utils/validation"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// All score routes require authentication
router.use(authenticateToken)

// POST /api/score/action
router.post("/action", validate(actionSchema), scoreController.executeAction)

// GET /api/score/history
router.get("/history", scoreController.getUserActionHistory)

// GET /api/score/problem
router.get("/problem", scoreController.generateProblem)

export default router
