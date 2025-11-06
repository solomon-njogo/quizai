# Database Schema Files

This directory contains the database schema split into separate SQL files for better maintainability.

## Execution Order

Run these SQL files in the following order in your Supabase SQL Editor:

1. **01_functions.sql** - Shared database functions
2. **02_courses.sql** - Courses table (must be created before quizzes and course_materials)
3. **03_quizzes.sql** - Quizzes table
4. **04_quiz_attempts.sql** - Quiz attempts table
5. **05_course_materials.sql** - Course materials table
6. **07_extracted_texts.sql** - Extracted texts table (depends on course_materials)
7. **08_backfill_extracted_texts.sql** - Migration to backfill existing course materials (run after 07_extracted_texts.sql if you have existing data)

## File Descriptions

- **01_functions.sql**: Contains shared functions used by multiple tables (e.g., `update_updated_at_column()`)
- **02_courses.sql**: Defines the courses table with RLS policies and triggers
- **03_quizzes.sql**: Defines the quizzes table with RLS policies, triggers, and course relationship
- **04_quiz_attempts.sql**: Defines the quiz_attempts table for storing quiz results/history
- **05_course_materials.sql**: Defines the course_materials table with RLS policies, triggers, and course relationship
- **07_extracted_texts.sql**: Defines the extracted_texts table for storing extracted text separately from course_materials, with one-to-one relationship and RLS policies
- **08_backfill_extracted_texts.sql**: Migration script to backfill existing course_materials data into the extracted_texts table (only needed if you have existing course materials with extracted_text)

## Notes

- All files use `IF NOT EXISTS` clauses to allow safe re-execution
- Row Level Security (RLS) is enabled on all tables
- All tables include proper indexes for performance
- Foreign key relationships are properly defined with CASCADE/SET NULL behaviors

