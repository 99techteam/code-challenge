import express from 'express';
import db from '../db.js';
import { broadcastProblem6 } from '../../WebSocket.js';
import quizQuestions from './QuizAndAns.js';
import Authorization from '../middlewares/authorization.js';
import { userLimiter, ipLimiter } from '../middlewares/ratelimiter.js';
import logEvent from '../middlewares/auditLogger.js';
import getClientIp from '../middlewares/getClientIp.js';
import quizSchema from '../middlewares/QuizValidator.js';
const router = express.Router();

router.get('/leaderboard', (req, res) => {
  try {
    const stmt = db.prepare("SELECT name, score FROM users LIMIT 10 ORDER BY score DESC");
    const users = stmt.all();

    // Send via HTTP
    res.status(200).json(users); 

    // Broadcast only for Problem 6 clients
    broadcastProblem6({ leaderboard: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.post("/submit-quiz", Authorization, userLimiter, ipLimiter, (req, res) => {
  try {
    const { error, value } = quizSchema.validate(req.body, { abortEarly: false });
    let ip = req.ip;

    if (error) {
      logEvent("quiz_submission_invalid_input", req.userId, getClientIp(ip));
      return res.status(400).json({ error: error.details.map(d => d.message) });
    }

    const { answers } = value; 
    // answers = [{ questionId: 1, answer: "4" }, { questionId: 2, answer: "Paris" }]
    let userId = req.userId;
    

    let points = 0;
    answers.forEach(ans => {
      const q = quizQuestions.find(q => q.id === ans.questionId);
      if (q && String(q.correct).toLowerCase() === String(ans.answer).toLowerCase()) {
        points += 1;
      }
    });

 // Update DB with earned points
    const result = db.prepare("UPDATE users SET score = score + ? WHERE id = ?").run(points, userId);

    // If no rows updated, user not found
    if (result.changes === 0) {
      logEvent("quiz_submission_failed_user_not_found", userId, getClientIp(ip));
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch updated leaderboard
    const users = db.prepare("SELECT name, score FROM users ORDER BY score DESC LIMIT 10").all();
    
    // Broadcast live update
    broadcastProblem6({ type: 'leaderboardUpdate', leaderboard: users });
    logEvent("quiz_submission_success", userId, getClientIp(ip));
    res.json({ success: true, pointsEarned: points, leaderboard: users });

  } catch (err) {
    console.error(err);
    logEvent("quiz_submission_error", req.userId, getClientIp(ip));
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});



export default router;
