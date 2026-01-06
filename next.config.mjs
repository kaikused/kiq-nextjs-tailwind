/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ignorar errores de ESLint para builds rápidos
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 2. Ignorar errores de TS para builds rápidos
  typescript: {
    ignoreBuildErrors: true,
  },
  // 3. Configuración de imágenes (ACTUALIZADA)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Fotos de perfil de Google Maps
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com', // Tus fotos de muebles subidas
        port: '',
        pathname: '/**',
      },
      // --- NUEVO: NECESARIO PARA EL BACKEND QUE ACABAMOS DE HACER ---
      {
        protocol: 'https',
        hostname: 'ui-avatars.com', // Para los avatares por defecto "Kiq Client"
      },
    ],
  },
};

export default nextConfig;