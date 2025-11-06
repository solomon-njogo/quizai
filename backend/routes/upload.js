import express from 'express';
import { upload, handleUploadError } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import { extractText, cleanupFile } from '../services/fileParser.js';
import { uploadFileToStorage } from '../services/courseMaterialStorage.js';
import { createCourseMaterial } from '../services/courseMaterialService.js';
import { createExtractedText } from '../services/extractedTextService.js';
import path from 'path';

const router = express.Router();

/**
 * POST /api/upload
 * Upload a file to Supabase Storage, extract text content, and store metadata
 * Requires authentication
 */
// Async error wrapper to catch errors in async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post(
  '/',
  authenticateToken,
  upload.single('file'),
  handleUploadError,
  asyncHandler(async (req, res) => {
    let tempFilePath = null;

    try {
      console.log('Upload request received');
      console.log('Request file:', req.file ? 'File present' : 'No file');
      console.log('Request user:', req.user ? `User ID: ${req.user.id}` : 'No user');
      
      // Check if file was uploaded
      if (!req.file) {
        console.log('No file in request');
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please provide a file to upload'
        });
      }
      
      console.log('File details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      const filePath = req.file.path;
      tempFilePath = filePath; // Keep track for cleanup
      const mimeType = req.file.mimetype;
      const filename = req.file.originalname;
      const fileSize = req.file.size;
      const userId = req.user.id; // From authenticateToken middleware
      
      // Extract JWT token from Authorization header for database operations
      const authHeader = req.headers.authorization;
      const accessToken = authHeader ? authHeader.substring(7) : null; // Remove 'Bearer ' prefix

      // Extract text from file before uploading to storage
      const { text, extractionMethod, error: extractionError } = await extractText(filePath, mimeType);

      // Check for extraction errors
      if (extractionError) {
        // Clean up local file
        await cleanupFile(filePath);
        return res.status(400).json({
          error: 'Text extraction failed',
          message: extractionError
        });
      }

      // Upload file to Supabase Storage
      const { data: storageData, error: storageError } = await uploadFileToStorage(
        userId,
        filePath,
        filename,
        mimeType
      );

      // Clean up local file after uploading to storage
      await cleanupFile(filePath);
      tempFilePath = null;

      if (storageError || !storageData) {
        return res.status(500).json({
          error: 'Storage upload failed',
          message: storageError || 'Failed to upload file to storage'
        });
      }

      // Store metadata in database (pass access token for RLS)
      // Keep extracted_text in course_materials for backward compatibility
      const { data: materialData, error: dbError } = await createCourseMaterial(
        userId,
        {
          filename: path.basename(storageData.storagePath),
          originalFilename: filename,
          filePath: storageData.storagePath,
          fileSize: fileSize,
          mimeType: mimeType,
          extractedText: text,
          courseId: req.body.course_id || null
        },
        accessToken
      );

      if (dbError) {
        // If database insert fails, we should ideally clean up the storage file
        // For now, we'll just log the error and return the storage data
        console.error('Error storing course material metadata:', dbError);
        return res.status(500).json({
          error: 'Failed to store material metadata',
          message: dbError,
          // Still return the extracted text and storage info
          text: text,
          filename: filename,
          fileSize: fileSize,
          storagePath: storageData.storagePath
        });
      }

      // Store extracted text in separate table
      const { data: extractedTextData, error: extractedTextError } = await createExtractedText(
        materialData.id,
        userId,
        text,
        extractionMethod,
        accessToken
      );

      if (extractedTextError) {
        // Log error but don't fail the request since material was created successfully
        // and text is already stored in course_materials.extracted_text
        console.error('Error storing extracted text in separate table:', extractedTextError);
        // Continue with response - the text is still available in course_materials
      }

      // Return extracted text and material info
      return res.json({
        success: true,
        text: text,
        filename: filename,
        fileSize: fileSize,
        materialId: materialData.id,
        storagePath: storageData.storagePath,
        createdAt: materialData.created_at,
        extractedTextId: extractedTextData?.id || null
      });
    } catch (error) {
      console.error('Upload route error:', error);
      console.error('Error stack:', error.stack);
      
      // Clean up local file if it exists
      if (tempFilePath) {
        await cleanupFile(tempFilePath);
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Failed to process file upload',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  })
);

export default router;

