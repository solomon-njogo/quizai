import { supabase } from '../utils/supabase.js';

/**
 * Create a new course
 * @param {string} userId - User ID
 * @param {string} name - Course name
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function createCourse(userId, name) {
  try {
    if (!userId || !name) {
      return {
        data: null,
        error: 'Missing required fields: userId and name are required'
      };
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        user_id: userId,
        name: name.trim()
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating course:', error);
    return {
      data: null,
      error: `Failed to create course: ${error.message}`
    };
  }
}

/**
 * Get a single course by ID
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getCourse(courseId, userId) {
  try {
    if (!courseId || !userId) {
      return {
        data: null,
        error: 'Missing required fields: courseId and userId are required'
      };
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Course not found' };
      }
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting course:', error);
    return {
      data: null,
      error: `Failed to get course: ${error.message}`
    };
  }
}

/**
 * Get all courses for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options (limit, offset, orderBy)
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export async function getUserCourses(userId, options = {}) {
  try {
    if (!userId) {
      return {
        data: null,
        error: 'Missing required field: userId is required'
      };
    }

    let query = supabase
      .from('courses')
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
    console.error('Error getting user courses:', error);
    return {
      data: null,
      error: `Failed to get courses: ${error.message}`
    };
  }
}

/**
 * Update a course
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updates - Fields to update (name)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function updateCourse(courseId, userId, updates) {
  try {
    if (!courseId || !userId) {
      return {
        data: null,
        error: 'Missing required fields: courseId and userId are required'
      };
    }

    const allowedFields = ['name'];
    const updateData = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return {
        data: null,
        error: 'No valid fields to update'
      };
    }

    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Course not found or unauthorized' };
      }
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: 'Course not found or unauthorized' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating course:', error);
    return {
      data: null,
      error: `Failed to update course: ${error.message}`
    };
  }
}

/**
 * Delete a course
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteCourse(courseId, userId) {
  try {
    if (!courseId || !userId) {
      return {
        success: false,
        error: 'Missing required fields: courseId and userId are required'
      };
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting course:', error);
    return {
      success: false,
      error: `Failed to delete course: ${error.message}`
    };
  }
}

