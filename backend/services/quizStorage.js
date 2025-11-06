import { supabase } from '../utils/supabase.js';

/**
 * Create a new quiz in the database
 * @param {string} userId - User ID
 * @param {string} title - Quiz title
 * @param {Array} questions - Array of question objects
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function createQuiz(userId, title, questions, courseId = null) {
  try {
    // Validate input
    if (!userId || !title || !questions) {
      return {
        data: null,
        error: 'Missing required fields: userId, title, and questions are required'
      };
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return {
        data: null,
        error: 'Questions must be a non-empty array'
      };
    }

    // Validate question structure
    for (const question of questions) {
      if (!question.question || !Array.isArray(question.options) || 
          typeof question.correct !== 'number' || !question.explanation) {
        return {
          data: null,
          error: 'Invalid question structure. Each question must have: question, options (array), correct (number), and explanation'
        };
      }
    }

    const insertData = {
      user_id: userId,
      title: title.trim(),
      questions: questions
    };

    // Add course_id if provided
    if (courseId) {
      insertData.course_id = courseId;
    }

    const { data, error } = await supabase
      .from('quizzes')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating quiz:', error);
    return {
      data: null,
      error: `Failed to create quiz: ${error.message}`
    };
  }
}

/**
 * Get a single quiz by ID
 * @param {string} quizId - Quiz ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getQuiz(quizId, userId) {
  try {
    if (!quizId || !userId) {
      return {
        data: null,
        error: 'Missing required fields: quizId and userId are required'
      };
    }

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Quiz not found' };
      }
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting quiz:', error);
    return {
      data: null,
      error: `Failed to get quiz: ${error.message}`
    };
  }
}

/**
 * Get all quizzes for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options (limit, offset, orderBy)
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export async function getUserQuizzes(userId, options = {}) {
  try {
    if (!userId) {
      return {
        data: null,
        error: 'Missing required field: userId is required'
      };
    }

    let query = supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', userId);

    // Filter by course_id if provided
    if (options.courseId !== undefined && options.courseId !== null) {
      query = query.eq('course_id', options.courseId);
    }

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
    console.error('Error getting user quizzes:', error);
    return {
      data: null,
      error: `Failed to get quizzes: ${error.message}`
    };
  }
}

/**
 * Update an existing quiz
 * @param {string} quizId - Quiz ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updates - Fields to update (title, questions)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function updateQuiz(quizId, userId, updates) {
  try {
    if (!quizId || !userId) {
      return {
        data: null,
        error: 'Missing required fields: quizId and userId are required'
      };
    }

    // Validate updates
    const allowedFields = ['title', 'questions'];
    const updateData = {};
    
    if (updates.title !== undefined) {
      updateData.title = updates.title.trim();
    }
    
    if (updates.questions !== undefined) {
      if (!Array.isArray(updates.questions) || updates.questions.length === 0) {
        return {
          data: null,
          error: 'Questions must be a non-empty array'
        };
      }
      // Validate question structure
      for (const question of updates.questions) {
        if (!question.question || !Array.isArray(question.options) || 
            typeof question.correct !== 'number' || !question.explanation) {
          return {
            data: null,
            error: 'Invalid question structure. Each question must have: question, options (array), correct (number), and explanation'
          };
        }
      }
      updateData.questions = updates.questions;
    }

    if (Object.keys(updateData).length === 0) {
      return {
        data: null,
        error: 'No valid fields to update'
      };
    }

    const { data, error } = await supabase
      .from('quizzes')
      .update(updateData)
      .eq('id', quizId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Quiz not found or unauthorized' };
      }
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: 'Quiz not found or unauthorized' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating quiz:', error);
    return {
      data: null,
      error: `Failed to update quiz: ${error.message}`
    };
  }
}

/**
 * Delete a quiz
 * @param {string} quizId - Quiz ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteQuiz(quizId, userId) {
  try {
    if (!quizId || !userId) {
      return {
        success: false,
        error: 'Missing required fields: quizId and userId are required'
      };
    }

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return {
      success: false,
      error: `Failed to delete quiz: ${error.message}`
    };
  }
}

/**
 * Create a quiz attempt record
 * @param {string} userId - User ID
 * @param {string} quizId - Quiz ID
 * @param {number} score - Number of correct answers
 * @param {number} totalQuestions - Total number of questions
 * @param {number} percentage - Percentage score
 * @param {Array} answers - Array of selected answers (answer indices)
 * @param {Array} results - Array of result objects with question details
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function createQuizAttempt(userId, quizId, score, totalQuestions, percentage, answers, results) {
  try {
    if (!userId || !quizId || score === undefined || !totalQuestions || percentage === undefined || !answers || !results) {
      return {
        data: null,
        error: 'Missing required fields: userId, quizId, score, totalQuestions, percentage, answers, and results are required'
      };
    }

    // Get quiz to retrieve course_id if it exists
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('course_id')
      .eq('id', quizId)
      .single();

    if (quizError) {
      return {
        data: null,
        error: `Failed to fetch quiz: ${quizError.message}`
      };
    }

    const insertData = {
      user_id: userId,
      quiz_id: quizId,
      score: score,
      total_questions: totalQuestions,
      percentage: percentage,
      answers: answers,
      results: results,
    };

    // Add course_id if the quiz has one
    if (quiz.course_id) {
      insertData.course_id = quiz.course_id;
    }

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating quiz attempt:', error);
    return {
      data: null,
      error: `Failed to create quiz attempt: ${error.message}`
    };
  }
}

