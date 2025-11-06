# Database Schema Files

This directory contains the database schema split into separate SQL files for better maintainability.

## Execution Order

Run these SQL files in the following order in your Supabase SQL Editor:

1. **01_functions.sql** - Shared database functions
2. **02_courses.sql** - Courses table (must be created before quizzes and course_materials)
3. **03_quizzes.sql** - Quizzes table
4. **04_quiz_attempts.sql** - Quiz attempts table
5. **05_course_materials.sql** - Course materials table

## File Descriptions

- **01_functions.sql**: Contains shared functions used by multiple tables (e.g., `update_updated_at_column()`)
- **02_courses.sql**: Defines the courses table with RLS policies and triggers
- **03_quizzes.sql**: Defines the quizzes table with RLS policies, triggers, and course relationship
- **04_quiz_attempts.sql**: Defines the quiz_attempts table for storing quiz results/history
- **05_course_materials.sql**: Defines the course_materials table with RLS policies, triggers, and course relationship

## Notes

- All files use `IF NOT EXISTS` clauses to allow safe re-execution
- Row Level Security (RLS) is enabled on all tables
- All tables include proper indexes for performance
- Foreign key relationships are properly defined with CASCADE/SET NULL behaviors

