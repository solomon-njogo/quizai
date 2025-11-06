import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createQuiz,
  getQuiz,
  getUserQuizzes,
  updateQuiz,
  deleteQuiz
} from '../services/quizStorage.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/quizzes
 * Get all quizzes for the authenticated user
 * Query params: limit, offset, orderBy, orderDirection
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined,
      orderBy: req.query.orderBy || 'created_at',
      orderDirection: req.query.orderDirection || 'desc'
    };

    const { data, error } = await getUserQuizzes(userId, options);

    if (error) {
      return res.status(400).json({
        error: 'Failed to fetch quizzes',
        message: error
      });
    }

    return res.json({
      success: true,
      quizzes: data,
      count: data.length
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch quizzes'
    });
  }
});

/**
 * GET /api/quizzes/:id
 * Get a single quiz by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.id;

    const { data, error } = await getQuiz(quizId, userId);

    if (error) {
      if (error === 'Quiz not found') {
        return res.status(404).json({
          error: 'Not found',
          message: error
        });
      }
      return res.status(400).json({
        error: 'Failed to fetch quiz',
        message: error
      });
    }

    return res.json({
      success: true,
      quiz: data
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch quiz'
    });
  }
});

/**
 * POST /api/quizzes
 * Create a new quiz
 * Body: { title: string, questions: Array }
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, questions } = req.body;

    // Validate required fields
    if (!title || !questions) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title and questions are required'
      });
    }

    const { data, error } = await createQuiz(userId, title, questions);

    if (error) {
      return res.status(400).json({
        error: 'Failed to create quiz',
        message: error
      });
    }

    return res.status(201).json({
      success: true,
      quiz: data,
      message: 'Quiz created successfully'
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create quiz'
    });
  }
});

/**
 * PUT /api/quizzes/:id
 * Update an existing quiz
 * Body: { title?: string, questions?: Array }
 */
router.put('/:id', async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.id;
    const { title, questions } = req.body;

    // Validate that at least one field is provided
    if (!title && !questions) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'At least one field (title or questions) must be provided'
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (questions !== undefined) updates.questions = questions;

    const { data, error } = await updateQuiz(quizId, userId, updates);

    if (error) {
      if (error === 'Quiz not found or unauthorized') {
        return res.status(404).json({
          error: 'Not found',
          message: error
        });
      }
      return res.status(400).json({
        error: 'Failed to update quiz',
        message: error
      });
    }

    return res.json({
      success: true,
      quiz: data,
      message: 'Quiz updated successfully'
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update quiz'
    });
  }
});

/**
 * DELETE /api/quizzes/:id
 * Delete a quiz
 */
router.delete('/:id', async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.id;

    const { success, error } = await deleteQuiz(quizId, userId);

    if (error) {
      return res.status(400).json({
        error: 'Failed to delete quiz',
        message: error
      });
    }

    if (!success) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Quiz not found or unauthorized'
      });
    }

    return res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete quiz'
    });
  }
});

export default router;

