import express from 'express';
import { upload, handleUploadError } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import { extractText, cleanupFile } from '../services/fileParser.js';
import { uploadFileToStorage } from '../services/courseMaterialStorage.js';
import { createCourseMaterial } from '../services/courseMaterialService.js';
import path from 'path';

const router = express.Router();

/**
 * POST /api/upload
 * Upload a file to Supabase Storage, extract text content, and store metadata
 * Requires authentication
 */
router.post(
  '/',
  authenticateToken,
  upload.single('file'),
  handleUploadError,
  async (req, res) => {
    let tempFilePath = null;

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please provide a file to upload'
        });
      }

      const filePath = req.file.path;
      tempFilePath = filePath; // Keep track for cleanup
      const mimeType = req.file.mimetype;
      const filename = req.file.originalname;
      const fileSize = req.file.size;
      const userId = req.user.id; // From authenticateToken middleware

      // Extract text from file before uploading to storage
      const { text, error: extractionError } = await extractText(filePath, mimeType);

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

      if (storageError) {
        return res.status(500).json({
          error: 'Storage upload failed',
          message: storageError
        });
      }

      // Store metadata in database
      const { data: materialData, error: dbError } = await createCourseMaterial(userId, {
        filename: path.basename(storageData.storagePath),
        originalFilename: filename,
        filePath: storageData.storagePath,
        fileSize: fileSize,
        mimeType: mimeType,
        extractedText: text
      });

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

      // Return extracted text and material info
      return res.json({
        success: true,
        text: text,
        filename: filename,
        fileSize: fileSize,
        materialId: materialData.id,
        storagePath: storageData.storagePath,
        createdAt: materialData.created_at
      });
    } catch (error) {
      console.error('Upload route error:', error);
      
      // Clean up local file if it exists
      if (tempFilePath) {
        await cleanupFile(tempFilePath);
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process file upload'
      });
    }
  }
);

export default router;

