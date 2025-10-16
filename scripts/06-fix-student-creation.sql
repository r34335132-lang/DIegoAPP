-- Fix RLS policies to allow student creation by coaches

-- Drop and recreate profiles policies to allow coaches to create student profiles
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Coaches can create student profiles" ON profiles;

-- Allow authenticated users to insert profiles (needed for student creation)
CREATE POLICY "Coaches can create student profiles" ON profiles
  FOR INSERT WITH CHECK (
    -- Allow if the user creating is a coach (checked via function)
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'coach'
    )
    OR
    -- Or if it's the user's own profile
    auth.uid() = id
  );

-- Also ensure students table allows inserts from coaches
DROP POLICY IF EXISTS "Coaches can insert students" ON students;

CREATE POLICY "Coaches can insert students" ON students
  FOR INSERT WITH CHECK (
    -- Coach must be creating a student for themselves
    coach_id = auth.uid()
  );
