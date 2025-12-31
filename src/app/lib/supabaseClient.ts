import { createClient } from '@supabase/supabase-js';

// 1. Leemos las variables de entorno que configuraste en .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. Verificación de seguridad: Si faltan, avisamos en la consola para no volverte loco buscando el error
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('❌ Faltan las variables de entorno de Supabase en .env.local');
}

// 3. Exportamos la conexión lista para usar en toda la app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);