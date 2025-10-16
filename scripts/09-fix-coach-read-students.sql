-- Fix RLS policies to allow coaches to read their students
-- This script ensures coaches can see their students in the UI

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Coaches can view their students" ON students;
DROP POLICY IF EXISTS "Coaches can view all profiles" ON profiles;

-- Create new policies that work correctly

-- Allow coaches to read their own students
CREATE POLICY "Coaches can view their students"
ON students
FOR SELECT
USING (
  coach_id IN (
    SELECT id FROM profiles WHERE id = auth.uid() AND role = 'coach'
  )
);

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (id = auth.uid());

-- Allow coaches to read profiles of their students
CREATE POLICY "Coaches can view student profiles"
ON profiles
FOR SELECT
USING (
  id IN (
    SELECT s.id 
    FROM students s
    WHERE s.coach_id = auth.uid()
  )
  OR id = auth.uid()
);

-- Ensure students table has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_coach_id ON students(coach_id);
CREATE INDEX IF NOT EXISTS idx_students_id ON students(id);

-- Grant necessary permissions
GRANT SELECT ON students TO authenticated;
GRANT SELECT ON profiles TO authenticated;
