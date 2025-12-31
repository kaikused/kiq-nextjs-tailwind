import { createClient } from '@supabase/supabase-js';

// 1. Leemos las variables de entorno que configuraste en .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. MODIFICACIÓN CRÍTICA PARA PRODUCCIÓN:
// En lugar de lanzar un error que rompe el build (throw Error),
// verificamos si existen. Si no, devolvemos null o un cliente inactivo.
// Esto permite que el despliegue en Vercel termine con éxito aunque no uses Supabase aún.

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Solo mostramos advertencia en consola para depuración, pero NO detenemos la app
  console.warn('⚠️ Supabase no está configurado: Faltan variables de entorno. El cliente será null.');
}

// 3. Exportamos la conexión (puede ser null, el código que la use debe verificarlo)
export { supabase };