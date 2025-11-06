import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createCourse,
  getCourse,
  getUserCourses,
  updateCourse,
  deleteCourse
} from '../services/courseService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/courses
 * Get all courses for the authenticated user
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

    const { data, error } = await getUserCourses(userId, options);

    if (error) {
      return res.status(400).json({
        error: 'Failed to fetch courses',
        message: error
      });
    }

    return res.json({
      success: true,
      courses: data,
      count: data.length
    });
  } catch (error) {
    console.error('Get courses error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch courses'
    });
  }
});

/**
 * GET /api/courses/:id
 * Get a single course by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    const { data, error } = await getCourse(courseId, userId);

    if (error) {
      if (error === 'Course not found') {
        return res.status(404).json({
          error: 'Not found',
          message: error
        });
      }
      return res.status(400).json({
        error: 'Failed to fetch course',
        message: error
      });
    }

    return res.json({
      success: true,
      course: data
    });
  } catch (error) {
    console.error('Get course error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch course'
    });
  }
});

/**
 * POST /api/courses
 * Create a new course
 * Body: { name: string }
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name is required'
      });
    }

    const { data, error } = await createCourse(userId, name);

    if (error) {
      return res.status(400).json({
        error: 'Failed to create course',
        message: error
      });
    }

    return res.status(201).json({
      success: true,
      course: data,
      message: 'Course created successfully'
    });
  } catch (error) {
    console.error('Create course error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create course'
    });
  }
});

/**
 * PUT /api/courses/:id
 * Update an existing course
 * Body: { name?: string }
 */
router.put('/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;
    const { name } = req.body;

    // Validate that at least one field is provided
    if (!name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name must be provided'
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;

    const { data, error } = await updateCourse(courseId, userId, updates);

    if (error) {
      if (error === 'Course not found or unauthorized') {
        return res.status(404).json({
          error: 'Not found',
          message: error
        });
      }
      return res.status(400).json({
        error: 'Failed to update course',
        message: error
      });
    }

    return res.json({
      success: true,
      course: data,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Update course error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update course'
    });
  }
});

/**
 * DELETE /api/courses/:id
 * Delete a course
 */
router.delete('/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    const { success, error } = await deleteCourse(courseId, userId);

    if (error) {
      return res.status(400).json({
        error: 'Failed to delete course',
        message: error
      });
    }

    if (!success) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Course not found or unauthorized'
      });
    }

    return res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete course'
    });
  }
});

export default router;

