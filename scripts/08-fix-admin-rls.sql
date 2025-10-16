-- Arreglar políticas RLS para permitir que el service role (admin) pueda insertar sin restricciones
-- El service role debe poder hacer bypass de RLS automáticamente

-- Verificar que RLS está habilitado
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes de students para empezar limpio
DROP POLICY IF EXISTS "Coaches can view their students" ON students;
DROP POLICY IF EXISTS "Coaches can insert students" ON students;
DROP POLICY IF EXISTS "Coaches can update their students" ON students;
DROP POLICY IF EXISTS "Students can view their own data" ON students;
DROP POLICY IF EXISTS "Students can view own data" ON students;

-- Política para SELECT: Coaches ven sus estudiantes, estudiantes ven su propia info
CREATE POLICY "students_select_policy"
ON students FOR SELECT
TO authenticated
USING (
  coach_id = auth.uid() OR id = auth.uid()
);

-- Política para INSERT: Solo necesitamos verificar que existe un coach válido
-- El service role hace bypass automático de RLS, así que esta política solo aplica a usuarios normales
CREATE POLICY "students_insert_policy"
ON students FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = coach_id
    AND profiles.role = 'coach'
  )
);

-- Política para UPDATE: Coaches pueden actualizar sus estudiantes
CREATE POLICY "students_update_policy"
ON students FOR UPDATE
TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());

-- Política para DELETE: Coaches pueden eliminar sus estudiantes
CREATE POLICY "students_delete_policy"
ON students FOR DELETE
TO authenticated
USING (coach_id = auth.uid());

-- Verificar políticas de profiles también
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;

-- Permitir inserción de profiles (el trigger lo hace automáticamente)
CREATE POLICY "profiles_insert_policy"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (true);

-- Asegurar que todos pueden ver perfiles (necesario para joins)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "profiles_select_policy"
ON profiles FOR SELECT
TO authenticated
USING (true);

COMMENT ON POLICY "students_insert_policy" ON students IS 'Permite insertar estudiantes si existe un coach válido. Service role hace bypass automático.';
