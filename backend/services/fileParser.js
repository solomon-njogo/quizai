import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';

/**
 * Extract text from a file based on its MIME type
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<{text: string, extractionMethod?: string, error?: string}>}
 */
export async function extractText(filePath, mimeType) {
  try {
    let text = '';
    let extractionMethod = '';

    // Determine file type and extract text accordingly
    if (mimeType === 'application/pdf') {
      text = await extractFromPDF(filePath);
      extractionMethod = 'pdf-parse';
    } else if (mimeType === 'text/plain') {
      text = await extractFromTXT(filePath);
      extractionMethod = 'fs.readFile';
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractFromDOCX(filePath);
      extractionMethod = 'mammoth';
    } else {
      // Check by file extension as fallback
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.pdf') {
        text = await extractFromPDF(filePath);
        extractionMethod = 'pdf-parse';
      } else if (ext === '.txt') {
        text = await extractFromTXT(filePath);
        extractionMethod = 'fs.readFile';
      } else if (ext === '.docx') {
        text = await extractFromDOCX(filePath);
        extractionMethod = 'mammoth';
      } else {
        return {
          text: '',
          extractionMethod: '',
          error: 'Unsupported file type. Only PDF, TXT, and DOCX files are supported.'
        };
      }
    }

    // Normalize text
    text = normalizeText(text);

    if (!text || text.trim().length === 0) {
      return {
        text: '',
        extractionMethod: extractionMethod,
        error: 'No text content could be extracted from the file.'
      };
    }

    return { text, extractionMethod };
  } catch (error) {
    console.error('Error extracting text:', error);
    return {
      text: '',
      extractionMethod: '',
      error: `Failed to extract text: ${error.message}`
    };
  }
}

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>}
 */
async function extractFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

/**
 * Extract text from TXT file
 * @param {string} filePath - Path to TXT file
 * @returns {Promise<string>}
 */
async function extractFromTXT(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf-8');
    return text;
  } catch (error) {
    throw new Error(`TXT file reading failed: ${error.message}`);
  }
}

/**
 * Extract text from DOCX file
 * @param {string} filePath - Path to DOCX file
 * @returns {Promise<string>}
 */
async function extractFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error.message}`);
  }
}

/**
 * Normalize extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} - Normalized text
 */
function normalizeText(text) {
  if (!text) return '';

  return text
    // Replace multiple whitespace with single space
    .replace(/\s+/g, ' ')
    // Replace multiple newlines with double newline (paragraph break)
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    // Trim leading and trailing whitespace
    .trim();
}

/**
 * Clean up uploaded file after processing
 * @param {string} filePath - Path to file to delete
 */
export async function cleanupFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error cleaning up file:', error);
    // Don't throw - cleanup errors shouldn't break the flow
  }
}

