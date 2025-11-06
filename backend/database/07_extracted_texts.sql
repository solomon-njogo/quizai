-- QuizAI Database Schema - Extracted Texts Table
-- Run this SQL in your Supabase SQL Editor
-- Depends on: 01_functions.sql, 05_course_materials.sql

-- Create extracted_texts table
CREATE TABLE IF NOT EXISTS extracted_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_material_id UUID NOT NULL UNIQUE REFERENCES course_materials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  extracted_text TEXT NOT NULL,
  text_length BIGINT NOT NULL,
  word_count BIGINT NOT NULL,
  extraction_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for extracted_texts
CREATE INDEX IF NOT EXISTS idx_extracted_texts_course_material_id ON extracted_texts(course_material_id);
CREATE INDEX IF NOT EXISTS idx_extracted_texts_user_id ON extracted_texts(user_id);
CREATE INDEX IF NOT EXISTS idx_extracted_texts_created_at ON extracted_texts(created_at DESC);

-- Enable Row Level Security for extracted_texts
ALTER TABLE extracted_texts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own extracted texts
CREATE POLICY "Users can view their own extracted texts"
  ON extracted_texts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own extracted texts
CREATE POLICY "Users can insert their own extracted texts"
  ON extracted_texts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own extracted texts
CREATE POLICY "Users can update their own extracted texts"
  ON extracted_texts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own extracted texts
CREATE POLICY "Users can delete their own extracted texts"
  ON extracted_texts FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at on extracted_texts updates
CREATE TRIGGER update_extracted_texts_updated_at
  BEFORE UPDATE ON extracted_texts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

