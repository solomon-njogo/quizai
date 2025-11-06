-- QuizAI Database Schema - Course Materials Table
-- Run this SQL in your Supabase SQL Editor
-- Depends on: 01_functions.sql, 02_courses.sql

-- Create course_materials table
CREATE TABLE IF NOT EXISTS course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for course_materials
CREATE INDEX IF NOT EXISTS idx_course_materials_user_id ON course_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_created_at ON course_materials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON course_materials(course_id);

-- Enable Row Level Security for course_materials
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own course materials
CREATE POLICY "Users can view their own course materials"
  ON course_materials FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own course materials
CREATE POLICY "Users can insert their own course materials"
  ON course_materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own course materials
CREATE POLICY "Users can update their own course materials"
  ON course_materials FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own course materials
CREATE POLICY "Users can delete their own course materials"
  ON course_materials FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at on course_materials updates
CREATE TRIGGER update_course_materials_updated_at
  BEFORE UPDATE ON course_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

