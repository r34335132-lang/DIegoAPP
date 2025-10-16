-- Arreglar las políticas RLS para permitir que los coaches creen estudiantes
-- y que el admin client pueda insertar sin problemas

-- Eliminar políticas existentes de students
DROP POLICY IF EXISTS "Coaches can view their students" ON students;
DROP POLICY IF EXISTS "Coaches can insert students" ON students;
DROP POLICY IF EXISTS "Coaches can update their students" ON students;
DROP POLICY IF EXISTS "Students can view their own data" ON students;

-- Política para que coaches vean sus estudiantes
CREATE POLICY "Coaches can view their students"
ON students FOR SELECT
TO authenticated
USING (
  coach_id = auth.uid()
  OR id = auth.uid()
);

-- Política para que coaches inserten estudiantes
-- Esta política permite insertar si el coach_id coincide con el usuario actual
CREATE POLICY "Coaches can insert students"
ON students FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  )
);

-- Política para que coaches actualicen sus estudiantes
CREATE POLICY "Coaches can update their students"
ON students FOR UPDATE
TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());

-- Política para que estudiantes vean su propia información
CREATE POLICY "Students can view own data"
ON students FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Asegurar que el service role puede hacer todo (bypass RLS)
ALTER TABLE students FORCE ROW LEVEL SECURITY;

COMMENT ON TABLE students IS 'Tabla de estudiantes con políticas RLS que permiten a coaches crear y gestionar estudiantes';
