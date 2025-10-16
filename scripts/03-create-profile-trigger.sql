-- Modificando la función para usar SET para bypassear RLS
-- Función que se ejecuta automáticamente cuando se crea un usuario en auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'coach', -- Por defecto todos son coaches, se puede cambiar después
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dar permisos de ejecución a la función
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Trigger que ejecuta la función cuando se crea un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentario explicativo
COMMENT ON FUNCTION public.handle_new_user() IS 'Crea automáticamente un perfil en la tabla profiles cuando se registra un nuevo usuario en auth.users';
