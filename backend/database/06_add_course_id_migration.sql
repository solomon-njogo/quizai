-- QuizAI Database Migration - Add course_id to tables
-- Run this SQL in your Supabase SQL Editor
-- This migration adds course_id to quiz_attempts and ensures it exists in all related tables
-- IMPORTANT: Order matters - we must add course_id to quizzes first before populating quiz_attempts

-- Step 1: Ensure course_id exists in quizzes table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quizzes' AND column_name = 'course_id'
  ) THEN
    ALTER TABLE quizzes 
    ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
    
    -- Create index on course_id for quizzes (if it doesn't exist)
    CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
  END IF;
END $$;

-- Step 2: Ensure course_id exists in course_materials table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_materials' AND column_name = 'course_id'
  ) THEN
    ALTER TABLE course_materials 
    ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
    
    -- Create index on course_id for course_materials (if it doesn't exist)
    CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON course_materials(course_id);
  END IF;
END $$;

-- Step 3: Add course_id to quiz_attempts table (if it doesn't exist)
-- This must come after quizzes has course_id so we can populate it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_attempts' AND column_name = 'course_id'
  ) THEN
    ALTER TABLE quiz_attempts 
    ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
    
    -- Create index on course_id for quiz_attempts
    CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_id ON quiz_attempts(course_id);
    
    -- Populate course_id from the related quiz (now that quizzes.course_id exists)
    UPDATE quiz_attempts qa
    SET course_id = q.course_id
    FROM quizzes q
    WHERE qa.quiz_id = q.id AND q.course_id IS NOT NULL;
  END IF;
END $$;

