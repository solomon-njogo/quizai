import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getQuiz, createQuizAttempt } from '../services/quizStorage.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/submit
 * Calculate quiz score and return detailed results
 * Body: { quizId: string, answers: Array<number> }
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId, answers } = req.body;

    // Validate required fields
    if (!quizId || !answers) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'quizId and answers are required'
      });
    }

    // Validate answers is an array
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'answers must be an array'
      });
    }

    // Fetch quiz from database
    const { data: quiz, error: quizError } = await getQuiz(quizId, userId);

    if (quizError) {
      if (quizError === 'Quiz not found') {
        return res.status(404).json({
          error: 'Not found',
          message: quizError
        });
      }
      return res.status(400).json({
        error: 'Failed to fetch quiz',
        message: quizError
      });
    }

    // Validate answers array length matches questions
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Number of answers (${answers.length}) does not match number of questions (${quiz.questions.length})`
      });
    }

    // Calculate score and build results
    let score = 0;
    const results = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const selected = answers[i];
      const correct = question.correct;

      // Validate answer index
      if (selected < 0 || selected >= question.options.length) {
        return res.status(400).json({
          error: 'Validation error',
          message: `Invalid answer index ${selected} for question ${i + 1}`
        });
      }

      const isCorrect = selected === correct;
      if (isCorrect) {
        score++;
      }

      results.push({
        questionIndex: i,
        selected: selected,
        correct: correct,
        isCorrect: isCorrect,
        explanation: question.explanation
      });
    }

    // Calculate percentage
    const total = quiz.questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100 * 100) / 100 : 0;

    // Save quiz attempt to database
    const { data: attempt, error: attemptError } = await createQuizAttempt(
      userId,
      quizId,
      score,
      total,
      percentage,
      answers,
      results
    );

    if (attemptError) {
      console.error('Error saving quiz attempt:', attemptError);
      // Still return results even if saving fails
    }

    return res.json({
      success: true,
      score: score,
      total: total,
      percentage: percentage,
      results: results,
      attempt: attempt || null
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to calculate quiz score'
    });
  }
});

export default router;

