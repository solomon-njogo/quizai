import express from 'express';
import { upload, handleUploadError } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import { extractText, cleanupFile } from '../services/fileParser.js';
import path from 'path';

const router = express.Router();

/**
 * POST /api/upload
 * Upload a file and extract text content
 * Requires authentication
 */
router.post(
  '/',
  authenticateToken,
  upload.single('file'),
  handleUploadError,
  async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please provide a file to upload'
        });
      }

      const filePath = req.file.path;
      const mimeType = req.file.mimetype;
      const filename = req.file.originalname;
      const fileSize = req.file.size;

      // Extract text from file
      const { text, error: extractionError } = await extractText(filePath, mimeType);

      // Clean up uploaded file after processing
      await cleanupFile(filePath);

      // Check for extraction errors
      if (extractionError) {
        return res.status(400).json({
          error: 'Text extraction failed',
          message: extractionError
        });
      }

      // Return extracted text
      return res.json({
        success: true,
        text: text,
        filename: filename,
        fileSize: fileSize
      });
    } catch (error) {
      console.error('Upload route error:', error);
      
      // Clean up file if it exists
      if (req.file && req.file.path) {
        await cleanupFile(req.file.path);
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process file upload'
      });
    }
  }
);

export default router;

