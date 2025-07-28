import { Request, Response } from "express"
import { Application } from "express"
import { AuthenticatedRequest, ValidatedRequest, MathAction } from "../types"
import scoreService from "../services/scoreService"

class ScoreController {
  async executeAction(req: Request, res: Response): Promise<void> {
    try {
      const { action, operand1, operand2 }: MathAction = (req as ValidatedRequest).validatedData
      const userId = (req as AuthenticatedRequest).user.id

      // Calculate expected result
      let expectedResult: number
      switch (action) {
        case "plus":
          expectedResult = operand1 + operand2
          break
        case "minus":
          expectedResult = operand1 - operand2
          break
        default:
          res.status(400).json({
            success: false,
            message: "Invalid action type",
          })
          return
      }

      const result = await scoreService.executeAction(
        userId,
        action,
        operand1,
        operand2,
        expectedResult,
      )

      const socketHandler = (req.app as Application).get("socketHandler")

      if (socketHandler) {
        // Always get and broadcast updated leaderboard to all connected clients
        // This ensures real-time updates for everyone when any user scores
        const leaderboard = await scoreService.getLeaderboard()

        // Broadcast leaderboard update to ALL clients in leaderboard room
        socketHandler.sendLeaderboardUpdate({
          leaderboard,
          updated_at: new Date().toISOString(),
          triggered_by: userId,
        })

        socketHandler.sendScoreUpdate(userId, {
          new_score: result.new_score,
          points_earned: result.points_earned,
          updated_at: new Date().toISOString(),
        })

        console.log(`Broadcasted leaderboard update triggered by user ${userId}`)
      }

      res.status(200).json({
        success: true,
        result: expectedResult,
        points_earned: result.points_earned,
        new_score: result.new_score,
        message: "Action completed successfully",
      })
    } catch (error: any) {
      console.error("Execute action controller error:", error)

      if (error.message.includes("Invalid math operation")) {
        res.status(400).json({
          success: false,
          message: "Invalid math operation result",
        })
        return
      }

      res.status(500).json({
        success: false,
        message: "Action execution failed. Please try again.",
      })
    }
  }

  async generateProblem(req: Request, res: Response): Promise<void> {
    try {
      const problem = scoreService.generateMathProblem()

      res.status(200).json({ success: true, problem })
    } catch (error: any) {
      console.error("Generate problem controller error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to generate math problem",
      })
    }
  }

  async getUserActionHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id
      const limit = parseInt(req.query.limit as string) || 10

      const history = await scoreService.getUserActionHistory(userId, limit)

      res.status(200).json({
        success: true,
        history,
      })
    } catch (error: any) {
      console.error("Get user action history controller error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve action history",
      })
    }
  }
}

export default new ScoreController()
