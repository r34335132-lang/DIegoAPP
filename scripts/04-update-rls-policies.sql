-- Simplificando políticas RLS para permitir inserción del trigger
-- Eliminar políticas existentes de profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
DROP POLICY IF EXISTS "Coaches can update student profiles" ON profiles;

-- Política para ver el propio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política para actualizar el propio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política para que coaches vean todos los perfiles
CREATE POLICY "Coaches can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'coach'
  )
);

-- Política para que coaches actualicen perfiles de estudiantes
CREATE POLICY "Coaches can update student profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'coach'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'coach'
  )
);

-- Agregando política para permitir INSERT desde funciones con SECURITY DEFINER
-- Esta política permite que el trigger inserte perfiles
CREATE POLICY "Allow insert from trigger"
ON profiles FOR INSERT
WITH CHECK (true);
