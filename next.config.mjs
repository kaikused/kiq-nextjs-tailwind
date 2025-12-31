// En: next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // 👇 ESTE ES EL NUEVO QUE SOLUCIONA EL ERROR
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**', // Permite cargar cualquier imagen de cualquier bucket
      },
    ],
  },
};

export default nextConfig;