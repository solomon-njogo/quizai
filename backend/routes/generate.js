import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { generateQuiz } from '../services/aiGenerator.js';
import { getCourse } from '../services/courseService.js';
import { getCourseMaterial } from '../services/courseMaterialService.js';
import { getExtractedTextByMaterialId, createExtractedText } from '../services/extractedTextService.js';
import { downloadFileFromStorage } from '../services/courseMaterialStorage.js';
import { extractText, cleanupFile } from '../services/fileParser.js';
import { createQuiz } from '../services/quizStorage.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/generate
 * Generate a quiz from selected course materials
 * Body: { course_id: string, material_ids: string[] }
 */
router.post('/', async (req, res) => {
  try {
    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'OPENROUTER_API_KEY is not configured. Please add it to your backend .env file.'
      });
    }

    const userId = req.user.id;
    const { course_id, material_ids } = req.body;

    // Validate required fields
    if (!course_id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'course_id is required'
      });
    }

    if (!material_ids || !Array.isArray(material_ids) || material_ids.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'material_ids must be a non-empty array'
      });
    }

    // Get course name
    const { data: course, error: courseError } = await getCourse(course_id, userId);
    if (courseError || !course) {
      return res.status(404).json({
        error: 'Course not found',
        message: courseError || 'Course not found'
      });
    }

    // Extract JWT token for RLS operations
    const authHeader = req.headers.authorization;
    const accessToken = authHeader ? authHeader.substring(7) : null;

    // Process each material: get or extract text
    const materialTexts = [];
    const materialNames = [];
    const extractionErrors = [];

    for (const materialId of material_ids) {
      try {
        // Get material metadata
        const { data: material, error: materialError } = await getCourseMaterial(materialId, userId);
        if (materialError || !material) {
          extractionErrors.push(`Material ${materialId}: ${materialError || 'not found'}`);
          continue;
        }

        materialNames.push(material.original_filename || material.filename);

        // Check if extracted text exists
        let { data: extractedText, error: extractedTextError } = await getExtractedTextByMaterialId(materialId, userId);

        if (extractedTextError || !extractedText) {
          // Extract text on-the-fly
          console.log(`Extracting text for material ${materialId}...`);

          // Download file from storage
          const { data: downloadData, error: downloadError } = await downloadFileFromStorage(material.file_path);
          if (downloadError || !downloadData) {
            extractionErrors.push(`${material.original_filename || material.filename}: Failed to download file`);
            continue;
          }

          let tempFilePath = downloadData.tempPath;

          try {
            // Extract text from file
            const { text, extractionMethod, error: extractError } = await extractText(tempFilePath, material.mime_type);
            
            // Clean up temp file
            await cleanupFile(tempFilePath);
            tempFilePath = null;

            if (extractError || !text) {
              extractionErrors.push(`${material.original_filename || material.filename}: ${extractError || 'No text extracted'}`);
              continue;
            }

            // Store extracted text in database
            const { data: newExtractedText, error: createError } = await createExtractedText(
              materialId,
              userId,
              text,
              extractionMethod,
              accessToken
            );

            if (createError) {
              console.error(`Failed to store extracted text for material ${materialId}:`, createError);
              // Continue anyway with the extracted text
            }

            extractedText = newExtractedText || { extracted_text: text };
          } catch (error) {
            // Clean up temp file if still exists
            if (tempFilePath) {
              await cleanupFile(tempFilePath).catch(() => {});
            }
            throw error;
          }
        }

        if (extractedText && extractedText.extracted_text) {
          materialTexts.push(extractedText.extracted_text);
        } else {
          extractionErrors.push(`${material.original_filename || material.filename}: No text content available`);
        }
      } catch (error) {
        console.error(`Error processing material ${materialId}:`, error);
        extractionErrors.push(`Material ${materialId}: ${error.message}`);
      }
    }

    // Check if we have any text to generate quiz from
    if (materialTexts.length === 0) {
      return res.status(400).json({
        error: 'No text content available',
        message: `Could not extract text from any materials. ${extractionErrors.length > 0 ? 'Errors: ' + extractionErrors.join('; ') : ''}`
      });
    }

    // Combine all texts
    const combinedText = materialTexts.join('\n\n---\n\n');

    // Generate quiz using AI
    console.log('Generating quiz with AI...');
    const { questions, error: generateError } = await generateQuiz(combinedText);

    if (generateError || !questions) {
      return res.status(500).json({
        error: 'Quiz generation failed',
        message: generateError || 'Failed to generate quiz questions',
        extractionErrors: extractionErrors.length > 0 ? extractionErrors : undefined
      });
    }

    // Auto-generate quiz title
    const materialNamesStr = materialNames.slice(0, 3).join(', ');
    const titleSuffix = materialNames.length > 3 ? ` and ${materialNames.length - 3} more` : '';
    const quizTitle = `Quiz: ${course.name} - ${materialNamesStr}${titleSuffix}`;

    // Create quiz in database
    const { data: quiz, error: createQuizError } = await createQuiz(userId, quizTitle, questions, course_id);

    if (createQuizError) {
      return res.status(500).json({
        error: 'Failed to save quiz',
        message: createQuizError
      });
    }

    // Return created quiz
    return res.status(201).json({
      success: true,
      quiz: quiz,
      message: 'Quiz generated successfully',
      warnings: extractionErrors.length > 0 ? extractionErrors : undefined
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to generate quiz',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;

