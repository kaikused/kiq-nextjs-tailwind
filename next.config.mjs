/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    // ¡Hemos borrado la línea 'localeDetection: true'!
  },
};
export default nextConfig;