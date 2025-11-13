// En: next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... otras configuraciones

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'googleusercontent.com', // 👈 Mantenemos este por si acaso
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // 👈 ¡ESTE ES EL DOMINIO QUE FALTA!
      },
    ],
  },

  // ...
};

export default nextConfig;