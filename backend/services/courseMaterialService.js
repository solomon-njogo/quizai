import { supabase, supabaseAuth } from '../utils/supabase.js';
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
 * Create a new course material record
 * @param {string} userId - User ID
 * @param {Object} materialData - Material data
 * @param {string} accessToken - User's JWT access token (for RLS)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function createCourseMaterial(userId, materialData, accessToken = null) {
  try {
    const { filename, originalFilename, filePath, fileSize, mimeType, extractedText } = materialData;

    if (!userId || !filename || !originalFilename || !filePath || !fileSize || !mimeType) {
      return {
        data: null,
        error: 'Missing required fields'
      };
    }

    // Use authenticated client if token is provided, otherwise fall back to service role
    const client = accessToken ? createAuthenticatedClient(accessToken) : supabase;

    const { data, error } = await client
      .from('course_materials')
      .insert({
        user_id: userId,
        filename: filename,
        original_filename: originalFilename,
        file_path: filePath,
        file_size: fileSize,
        mime_type: mimeType,
        extracted_text: extractedText || null
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating course material:', error);
    return {
      data: null,
      error: `Failed to create course material: ${error.message}`
    };
  }
}

/**
 * Get a course material by ID
 * @param {string} materialId - Material ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getCourseMaterial(materialId, userId) {
  try {
    if (!materialId || !userId) {
      return {
        data: null,
        error: 'Missing required fields: materialId and userId are required'
      };
    }

    const { data, error } = await supabase
      .from('course_materials')
      .select('*')
      .eq('id', materialId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Course material not found' };
      }
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting course material:', error);
    return {
      data: null,
      error: `Failed to get course material: ${error.message}`
    };
  }
}

/**
 * Get all course materials for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options (limit, offset, orderBy)
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export async function getUserCourseMaterials(userId, options = {}) {
  try {
    if (!userId) {
      return {
        data: null,
        error: 'Missing required field: userId is required'
      };
    }

    let query = supabase
      .from('course_materials')
      .select('*')
      .eq('user_id', userId);

    // Apply ordering (default: newest first)
    const orderBy = options.orderBy || 'created_at';
    const orderDirection = options.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error getting user course materials:', error);
    return {
      data: null,
      error: `Failed to get course materials: ${error.message}`
    };
  }
}

/**
 * Update a course material
 * @param {string} materialId - Material ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function updateCourseMaterial(materialId, userId, updates) {
  try {
    if (!materialId || !userId) {
      return {
        data: null,
        error: 'Missing required fields: materialId and userId are required'
      };
    }

    const allowedFields = ['filename', 'original_filename', 'extracted_text'];
    const updateData = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return {
        data: null,
        error: 'No valid fields to update'
      };
    }

    const { data, error } = await supabase
      .from('course_materials')
      .update(updateData)
      .eq('id', materialId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Course material not found or unauthorized' };
      }
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: 'Course material not found or unauthorized' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating course material:', error);
    return {
      data: null,
      error: `Failed to update course material: ${error.message}`
    };
  }
}

/**
 * Delete a course material
 * @param {string} materialId - Material ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteCourseMaterial(materialId, userId) {
  try {
    if (!materialId || !userId) {
      return {
        success: false,
        error: 'Missing required fields: materialId and userId are required'
      };
    }

    const { error } = await supabase
      .from('course_materials')
      .delete()
      .eq('id', materialId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting course material:', error);
    return {
      success: false,
      error: `Failed to delete course material: ${error.message}`
    };
  }
}

