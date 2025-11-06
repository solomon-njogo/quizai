-- QuizAI Database Migration - Backfill Extracted Texts
-- Run this SQL in your Supabase SQL Editor AFTER running 07_extracted_texts.sql
-- This migration backfills the extracted_texts table with existing data from course_materials

-- Function to calculate word count (helper function for migration)
CREATE OR REPLACE FUNCTION calculate_word_count(text_content TEXT)
RETURNS BIGINT AS $$
BEGIN
  IF text_content IS NULL OR text_content = '' THEN
    RETURN 0;
  END IF;
  
  -- Remove extra whitespace and count words
  RETURN array_length(string_to_array(trim(regexp_replace(text_content, '\s+', ' ', 'g')), ' '), 1);
END;
$$ LANGUAGE plpgsql;

-- Insert extracted texts for existing course materials that have extracted_text but no entry in extracted_texts
-- Use 'migration' as extraction_method since we don't know the original method
INSERT INTO extracted_texts (
  course_material_id,
  user_id,
  extracted_text,
  text_length,
  word_count,
  extraction_method,
  created_at,
  updated_at
)
SELECT 
  cm.id AS course_material_id,
  cm.user_id,
  cm.extracted_text,
  LENGTH(cm.extracted_text) AS text_length,
  calculate_word_count(cm.extracted_text) AS word_count,
  'migration' AS extraction_method,
  cm.created_at,
  cm.updated_at
FROM course_materials cm
WHERE 
  cm.extracted_text IS NOT NULL 
  AND cm.extracted_text != ''
  AND NOT EXISTS (
    SELECT 1 
    FROM extracted_texts et 
    WHERE et.course_material_id = cm.id
  )
ON CONFLICT (course_material_id) DO NOTHING;

-- Drop the helper function after migration (optional, can keep it if useful)
-- DROP FUNCTION IF EXISTS calculate_word_count(TEXT);

-- Verify the migration
-- Run this query to check how many records were migrated:
-- SELECT COUNT(*) as migrated_count FROM extracted_texts WHERE extraction_method = 'migration';

