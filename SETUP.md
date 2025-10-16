# Guía de Configuración - FitCoach App

## 1. Configurar Supabase

### Crear proyecto en Supabase
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto
3. Guarda la contraseña de la base de datos

### Obtener las credenciales
1. En tu proyecto, ve a **Settings > API**
2. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Ejecutar los scripts SQL
1. En Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido de cada script en orden:
   - `scripts/01-create-tables.sql` - Crea todas las tablas
   - `scripts/02-enable-rls.sql` - Habilita seguridad RLS
   - `scripts/03-create-profile-trigger.sql` - **IMPORTANTE**: Crea el trigger para perfiles automáticos
   - `scripts/04-update-rls-policies.sql` - Actualiza políticas de seguridad
4. Ejecuta cada script (Run) en orden

> ⚠️ **IMPORTANTE**: El script `03-create-profile-trigger.sql` es esencial para que el registro funcione correctamente. Este trigger crea automáticamente el perfil del usuario cuando se registra, evitando errores de RLS.

### Configurar autenticación por email
1. Ve a **Authentication > Providers**
2. Asegúrate de que **Email** esté habilitado
3. En **Authentication > URL Configuration**, agrega:
   - Site URL: `http://localhost:3000` (desarrollo)
   - Redirect URLs: `http://localhost:3000/**`

## 2. Configurar Vercel Blob

### Opción A: Usar v0 (Recomendado)
Si estás usando v0, la integración de Blob ya está configurada automáticamente:
- La variable `BLOB_READ_WRITE_TOKEN` ya está disponible
- No necesitas hacer nada adicional
- Los videos se subirán automáticamente

### Opción B: Configuración manual
1. Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto (o créalo)
3. Ve a **Storage** en el menú lateral
4. Click en **Create Database**
5. Selecciona **Blob** y crea el store
6. Copia el **Read-Write Token** → `BLOB_READ_WRITE_TOKEN`

## 3. Configurar variables de entorno

### Desarrollo local
1. Copia el archivo `.env.example` a `.env.local`:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Edita `.env.local` y agrega tus claves:
   \`\`\`bash
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   BLOB_READ_WRITE_TOKEN=tu-blob-token-aqui
   \`\`\`

### Producción (Vercel)
1. Ve a tu proyecto en Vercel
2. Ve a **Settings > Environment Variables**
3. Agrega las mismas variables (excepto `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`)

## 4. Instalar dependencias y ejecutar

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
\`\`\`

## 5. Crear tu primer usuario Coach

1. Ve a `http://localhost:3000/register`
2. Registra un usuario con rol "coach"
3. El perfil se creará automáticamente gracias al trigger
4. Inicia sesión en `/login`

## Estructura de la aplicación

### Para Coaches
- `/coach` - Dashboard principal
- `/coach/students` - Gestión de alumnos
- `/coach/exercises` - Gestión de ejercicios
- `/coach/routines` - Gestión de rutinas
- `/coach/chat` - Chat con alumnos

### Para Alumnos
- `/student` - Dashboard del alumno
- `/student/workout` - Tracker de entrenamiento
- `/student/chat` - Chat con el coach

## Funcionalidades principales

✅ Autenticación con Supabase (email/password)
✅ Dashboard para coaches con estadísticas
✅ Gestión completa de alumnos (crear, editar, ver perfil)
✅ Subida de videos de ejercicios con Vercel Blob
✅ Creación de rutinas personalizadas
✅ Tracker de entrenamientos con cronómetro
✅ Notificaciones automáticas al coach
✅ Chat en tiempo real entre coach y alumnos
✅ Funcionalidad offline para ver rutinas
✅ Optimizado para móvil

## Solución de problemas

### Error: "new row violates row-level security policy for table 'profiles'"
**Solución**: Asegúrate de haber ejecutado el script `03-create-profile-trigger.sql`. Este trigger crea automáticamente el perfil cuando se registra un usuario.

### Error de autenticación
- Verifica que las URLs de redirect estén configuradas en Supabase
- Asegúrate de que el email provider esté habilitado

### Videos no se suben
- Si usas v0: La variable `BLOB_READ_WRITE_TOKEN` ya está configurada automáticamente
- Si es manual: Verifica que el token sea correcto y que tengas un Blob Store creado

### Chat no funciona en tiempo real
- Verifica que los scripts SQL se hayan ejecutado correctamente
- Revisa que Row Level Security esté habilitado

## Soporte

Si tienes problemas, revisa:
1. La consola del navegador para errores
2. Los logs de Supabase (Logs > Query Performance)
3. Las variables de entorno estén correctamente configuradas
