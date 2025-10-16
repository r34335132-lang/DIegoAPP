-- Arreglando la recursión infinita en las políticas RLS de profiles
-- El problema es que las políticas intentan leer profiles para verificar el rol,
-- lo cual causa recursión infinita.

-- Primero, eliminamos las políticas problemáticas
DROP POLICY IF EXISTS "Coaches can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Coaches can update student profiles" ON profiles;

-- Crear una función que verifique si el usuario actual es coach
-- usando SECURITY DEFINER para evitar recursión en RLS
CREATE OR REPLACE FUNCTION public.is_coach()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'coach'
  );
END;
$$;

-- Ahora recreamos las políticas usando la función
CREATE POLICY "Coaches can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (public.is_coach());

CREATE POLICY "Coaches can update student profiles"
ON profiles FOR UPDATE
TO authenticated
USING (public.is_coach())
WITH CHECK (public.is_coach());

-- Comentario explicativo
COMMENT ON FUNCTION public.is_coach() IS 'Verifica si el usuario actual es un coach. Usa SECURITY DEFINER para evitar recursión infinita en las políticas RLS.';
