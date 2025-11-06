import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getCourseMaterial,
  getUserCourseMaterials,
  updateCourseMaterial,
  deleteCourseMaterial
} from '../services/courseMaterialService.js';
import { getSignedUrl, deleteFileFromStorage } from '../services/courseMaterialStorage.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/course-materials
 * Get all course materials for the authenticated user
 * Query params: limit, offset, orderBy, orderDirection
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Handle course_id parameter - convert empty strings to undefined
    let courseId = req.query.course_id;
    if (courseId === '' || courseId === null) {
      courseId = undefined;
    }
    
    // Validate UUID format if course_id is provided
    if (courseId !== undefined) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(courseId)) {
        console.error('Invalid course_id format:', courseId);
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid course_id format. Must be a valid UUID.'
        });
      }
    }
    
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined,
      orderBy: req.query.orderBy || 'created_at',
      orderDirection: req.query.orderDirection || 'desc',
      courseId: courseId
    };

    console.log('Fetching course materials for user:', userId, 'with options:', options);
    const { data, error } = await getUserCourseMaterials(userId, options);

    if (error) {
      console.error('Error fetching course materials:', error);
      console.error('User ID:', userId, 'Options:', options);
      return res.status(400).json({
        error: 'Failed to fetch course materials',
        message: error
      });
    }

    // Get signed URLs for each material
    const materialsWithUrls = await Promise.all(
      data.map(async (material) => {
        const { data: urlData } = await getSignedUrl(material.file_path, 3600); // 1 hour expiry
        return {
          ...material,
          downloadUrl: urlData?.url || null
        };
      })
    );

    return res.json({
      success: true,
      materials: materialsWithUrls,
      count: materialsWithUrls.length
    });
  } catch (error) {
    console.error('Get course materials error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch course materials'
    });
  }
});

/**
 * GET /api/course-materials/:id
 * Get a single course material by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const materialId = req.params.id;
    const userId = req.user.id;

    const { data, error } = await getCourseMaterial(materialId, userId);

    if (error) {
      if (error === 'Course material not found') {
        return res.status(404).json({
          error: 'Not found',
          message: error
        });
      }
      return res.status(400).json({
        error: 'Failed to fetch course material',
        message: error
      });
    }

    // Get signed URL for download
    const { data: urlData } = await getSignedUrl(data.file_path, 3600); // 1 hour expiry

    return res.json({
      success: true,
      material: {
        ...data,
        downloadUrl: urlData?.url || null
      }
    });
  } catch (error) {
    console.error('Get course material error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch course material'
    });
  }
});

/**
 * GET /api/course-materials/:id/download
 * Get a signed URL for downloading a course material file
 * Query params: expiresIn (optional, default: 3600 seconds)
 */
router.get('/:id/download', async (req, res) => {
  try {
    const materialId = req.params.id;
    const userId = req.user.id;
    const expiresIn = req.query.expiresIn ? parseInt(req.query.expiresIn) : 3600;

    // Get the material to verify ownership and get file path
    const { data: material, error: materialError } = await getCourseMaterial(materialId, userId);

    if (materialError) {
      if (materialError === 'Course material not found') {
        return res.status(404).json({
          error: 'Not found',
          message: materialError
        });
      }
      return res.status(400).json({
        error: 'Failed to fetch course material',
        message: materialError
      });
    }

    // Get signed URL
    const { data: urlData, error: urlError } = await getSignedUrl(material.file_path, expiresIn);

    if (urlError) {
      return res.status(500).json({
        error: 'Failed to generate download URL',
        message: urlError
      });
    }

    return res.json({
      success: true,
      downloadUrl: urlData.url,
      expiresIn: expiresIn,
      filename: material.original_filename
    });
  } catch (error) {
    console.error('Get download URL error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate download URL'
    });
  }
});

/**
 * PUT /api/course-materials/:id
 * Update an existing course material
 * Body: { filename?: string, original_filename?: string, extracted_text?: string }
 */
router.put('/:id', async (req, res) => {
  try {
    const materialId = req.params.id;
    const userId = req.user.id;
    const { filename, original_filename, extracted_text } = req.body;

    // Validate that at least one field is provided
    if (!filename && !original_filename && extracted_text === undefined) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'At least one field must be provided'
      });
    }

    const updates = {};
    if (filename !== undefined) updates.filename = filename;
    if (original_filename !== undefined) updates.original_filename = original_filename;
    if (extracted_text !== undefined) updates.extracted_text = extracted_text;

    const { data, error } = await updateCourseMaterial(materialId, userId, updates);

    if (error) {
      if (error === 'Course material not found or unauthorized') {
        return res.status(404).json({
          error: 'Not found',
          message: error
        });
      }
      return res.status(400).json({
        error: 'Failed to update course material',
        message: error
      });
    }

    return res.json({
      success: true,
      material: data,
      message: 'Course material updated successfully'
    });
  } catch (error) {
    console.error('Update course material error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update course material'
    });
  }
});

/**
 * DELETE /api/course-materials/:id
 * Delete a course material (both database record and storage file)
 */
router.delete('/:id', async (req, res) => {
  try {
    const materialId = req.params.id;
    const userId = req.user.id;

    // Get the material to get the file path before deleting
    const { data: material, error: materialError } = await getCourseMaterial(materialId, userId);

    if (materialError) {
      if (materialError === 'Course material not found') {
        return res.status(404).json({
          error: 'Not found',
          message: materialError
        });
      }
      return res.status(400).json({
        error: 'Failed to fetch course material',
        message: materialError
      });
    }

    // Delete from storage first
    const { success: storageSuccess, error: storageError } = await deleteFileFromStorage(material.file_path);
    
    if (!storageSuccess) {
      console.error('Failed to delete file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { success, error } = await deleteCourseMaterial(materialId, userId);

    if (error) {
      return res.status(400).json({
        error: 'Failed to delete course material',
        message: error
      });
    }

    if (!success) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Course material not found or unauthorized'
      });
    }

    return res.json({
      success: true,
      message: 'Course material deleted successfully'
    });
  } catch (error) {
    console.error('Delete course material error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete course material'
    });
  }
});

export default router;

