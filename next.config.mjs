/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de internacionalización (i18n)
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
  },

  // Configuración de optimización de imágenes (images)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
      },
    ],
  },
};

// 🌟 Importante: Exportación con sintaxis de ES Modules (.mjs)
export default nextConfig;