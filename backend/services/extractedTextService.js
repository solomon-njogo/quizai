import { supabase } from '../utils/supabase.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

/**
 * Create a Supabase client with user's JWT token for authenticated operations
 * This allows RLS policies to work correctly by setting the user context
 */
function createAuthenticatedClient(accessToken) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // Create client with anon key and set Authorization header for all requests
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
  
  return client;
}

/**
 * Calculate word count from text
 * @param {string} text - Text to count words in
 * @returns {number} - Word count
 */
function calculateWordCount(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  // Remove extra whitespace and split by whitespace
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Create a new extracted text record
 * @param {string} materialId - Course material ID
 * @param {string} userId - User ID
 * @param {string} text - Extracted text content
 * @param {string} extractionMethod - Method used for extraction (e.g., 'pdf-parse', 'mammoth', 'fs.readFile')
 * @param {string} accessToken - User's JWT access token (for RLS)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function createExtractedText(materialId, userId, text, extractionMethod, accessToken = null) {
  try {
    if (!materialId || !userId || !text || !extractionMethod) {
      return {
        data: null,
        error: 'Missing required fields: materialId, userId, text, and extractionMethod are required'
      };
    }

    // Calculate metadata
    const textLength = text.length;
    const wordCount = calculateWordCount(text);

    // Use authenticated client if token is provided, otherwise fall back to service role
    const client = accessToken ? createAuthenticatedClient(accessToken) : supabase;

    const insertData = {
      course_material_id: materialId,
      user_id: userId,
      extracted_text: text,
      text_length: textLength,
      word_count: wordCount,
      extraction_method: extractionMethod
    };

    const { data, error } = await client
      .from('extracted_texts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating extracted text:', error);
    return {
      data: null,
      error: `Failed to create extracted text: ${error.message}`
    };
  }
}

/**
 * Get extracted text by course material ID
 * @param {string} materialId - Course material ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getExtractedTextByMaterialId(materialId, userId) {
  try {
    if (!materialId || !userId) {
      return {
        data: null,
        error: 'Missing required fields: materialId and userId are required'
      };
    }

    const { data, error } = await supabase
      .from('extracted_texts')
      .select('*')
      .eq('course_material_id', materialId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Extracted text not found' };
      }
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting extracted text:', error);
    return {
      data: null,
      error: `Failed to get extracted text: ${error.message}`
    };
  }
}

/**
 * Update extracted text
 * @param {string} materialId - Course material ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} text - Updated text content
 * @param {string} extractionMethod - Method used for extraction
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function updateExtractedText(materialId, userId, text, extractionMethod) {
  try {
    if (!materialId || !userId || !text || !extractionMethod) {
      return {
        data: null,
        error: 'Missing required fields: materialId, userId, text, and extractionMethod are required'
      };
    }

    // Calculate metadata
    const textLength = text.length;
    const wordCount = calculateWordCount(text);

    const updateData = {
      extracted_text: text,
      text_length: textLength,
      word_count: wordCount,
      extraction_method: extractionMethod
    };

    const { data, error } = await supabase
      .from('extracted_texts')
      .update(updateData)
      .eq('course_material_id', materialId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Extracted text not found or unauthorized' };
      }
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: 'Extracted text not found or unauthorized' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating extracted text:', error);
    return {
      data: null,
      error: `Failed to update extracted text: ${error.message}`
    };
  }
}

/**
 * Delete extracted text
 * @param {string} materialId - Course material ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteExtractedText(materialId, userId) {
  try {
    if (!materialId || !userId) {
      return {
        success: false,
        error: 'Missing required fields: materialId and userId are required'
      };
    }

    const { error } = await supabase
      .from('extracted_texts')
      .delete()
      .eq('course_material_id', materialId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting extracted text:', error);
    return {
      success: false,
      error: `Failed to delete extracted text: ${error.message}`
    };
  }
}

