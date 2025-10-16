-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Eliminando todas las políticas existentes primero para evitar errores de duplicados

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Students policies
DROP POLICY IF EXISTS "Coaches can view their students" ON students;
DROP POLICY IF EXISTS "Coaches can insert students" ON students;
DROP POLICY IF EXISTS "Coaches can update their students" ON students;

-- Exercises policies
DROP POLICY IF EXISTS "Coaches can manage their exercises" ON exercises;
DROP POLICY IF EXISTS "Students can view exercises from their routines" ON exercises;

-- Routines policies
DROP POLICY IF EXISTS "Coaches can manage their routines" ON routines;
DROP POLICY IF EXISTS "Students can view their assigned routines" ON routines;

-- Routine exercises policies
DROP POLICY IF EXISTS "Coaches can manage routine exercises" ON routine_exercises;
DROP POLICY IF EXISTS "Students can view their routine exercises" ON routine_exercises;

-- Student routines policies
DROP POLICY IF EXISTS "Coaches can assign routines" ON student_routines;
DROP POLICY IF EXISTS "Students can view their assignments" ON student_routines;

-- Workout sessions policies
DROP POLICY IF EXISTS "Students can manage their sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Coaches can view their students' sessions" ON workout_sessions;

-- Messages policies
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Ahora creando todas las políticas

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- Students policies
CREATE POLICY "Coaches can view their students" ON students
  FOR SELECT USING (
    coach_id = auth.uid() OR id = auth.uid()
  );

CREATE POLICY "Coaches can insert students" ON students
  FOR INSERT WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can update their students" ON students
  FOR UPDATE USING (coach_id = auth.uid());

-- Exercises policies
CREATE POLICY "Coaches can manage their exercises" ON exercises
  FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "Students can view exercises from their routines" ON exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_routines sr
      JOIN routine_exercises re ON re.routine_id = sr.routine_id
      WHERE sr.student_id = auth.uid() AND re.exercise_id = exercises.id
    )
  );

-- Routines policies
CREATE POLICY "Coaches can manage their routines" ON routines
  FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "Students can view their assigned routines" ON routines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_routines
      WHERE student_id = auth.uid() AND routine_id = routines.id
    )
  );

-- Routine exercises policies
CREATE POLICY "Coaches can manage routine exercises" ON routine_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM routines WHERE id = routine_id AND coach_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their routine exercises" ON routine_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_routines
      WHERE student_id = auth.uid() AND routine_id = routine_exercises.routine_id
    )
  );

-- Student routines policies
CREATE POLICY "Coaches can assign routines" ON student_routines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students WHERE id = student_id AND coach_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their assignments" ON student_routines
  FOR SELECT USING (student_id = auth.uid());

-- Workout sessions policies
CREATE POLICY "Students can manage their sessions" ON workout_sessions
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Coaches can view their students' sessions" ON workout_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students WHERE id = student_id AND coach_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());
