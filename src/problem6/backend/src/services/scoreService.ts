import { ActionResult, LeaderboardEntry, UserAction, MathProblem } from "../types"
import prisma from "../utils/prisma"
import redisClient from "../utils/redis"
import { validateMathOperation } from "../utils/validation"

class ScoreService {
  async executeAction(
    userId: number,
    action: string,
    operand1: number,
    operand2: number,
    expectedResult: number,
  ): Promise<ActionResult> {
    try {
      // Validate the math operation
      const isValidOperation = validateMathOperation(action, operand1, operand2, expectedResult)
      if (!isValidOperation) {
        throw new Error("Invalid math operation result")
      }

      // Check if user has exceeded action limits
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
      const actionCount = await prisma.userAction.count({
        where: {
          userId,
          createdAt: {
            gte: oneMinuteAgo,
          },
        },
      })

      // Get current user data and update score in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } })
        if (!user) throw new Error("User not found")

        // Calculate new score (each correct action adds 1 point)
        const pointsEarned = 1
        const newScore = user.score + pointsEarned

        // Update user score
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { score: newScore },
        })

        // Log the action for audit trail
        await tx.userAction.create({
          data: {
            userId,
            actionType: action,
            operand1,
            operand2,
            result: expectedResult,
            pointsEarned,
          },
        })

        return { user, updatedUser, pointsEarned, newScore }
      })

      // Invalidate leaderboard cache since score changed
      await redisClient.invalidateLeaderboard()

      // Check if this affects the leaderboard (top 10)
      const currentLeaderboard = await this.getLeaderboard()
      const userInTop10 = currentLeaderboard.some((entry) => entry.id === userId)
      const userWasInTop10 = currentLeaderboard.some(
        (entry) => entry.id === userId && entry.score < result.newScore,
      )

      return {
        action: action as "plus" | "minus",
        operand1,
        operand2,
        result: expectedResult,
        points_earned: result.pointsEarned,
        new_score: result.newScore,
        leaderboard_affected:
          userInTop10 || userWasInTop10 || result.newScore > (currentLeaderboard[9]?.score || 0),
      }
    } catch (error) {
      console.error("Execute action error:", error)
      throw error
    }
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      // Try to get from cache first
      const cachedLeaderboard = await redisClient.getCachedLeaderboard()
      if (cachedLeaderboard) {
        return cachedLeaderboard
      }

      // Get from database
      const users = await prisma.user.findMany({
        orderBy: { score: "desc" },
        take: limit,
        select: {
          id: true,
          username: true,
          score: true,
        },
      })

      // Transform to LeaderboardEntry format
      const leaderboard: LeaderboardEntry[] = users.map((user, index) => ({
        id: user.id,
        username: user.username,
        score: user.score,
        rank: index + 1,
      }))

      // Cache the result
      await redisClient.cacheLeaderboard(leaderboard, 30) // 30 seconds TTL

      return leaderboard
    } catch (error) {
      console.error("Get leaderboard error:", error)
      throw error
    }
  }

  async getUserActionHistory(userId: number, limit: number = 10): Promise<UserAction[]> {
    try {
      const actions = await prisma.userAction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      })

      return actions
    } catch (error) {
      console.error("Get user action history error:", error)
      throw error
    }
  }

  // Generate a random math problem for the frontend
  generateMathProblem(): MathProblem {
    const operations: ("plus" | "minus")[] = ["plus", "minus"]
    const action = operations[Math.floor(Math.random() * operations.length)]!

    let operand1: number, operand2: number

    if (action === "plus") {
      operand1 = Math.floor(Math.random() * 100) + 1
      operand2 = Math.floor(Math.random() * 100) + 1
    } else {
      // minus
      operand1 = Math.floor(Math.random() * 100) + 50 // Ensure positive result
      operand2 = Math.floor(Math.random() * operand1) + 1
    }

    const result = action === "plus" ? operand1 + operand2 : operand1 - operand2

    return {
      action,
      operand1,
      operand2,
      expected_result: result,
      problem_text: `${operand1} ${action === "plus" ? "+" : "-"} ${operand2} = ?`,
    }
  }
}

export default new ScoreService()
