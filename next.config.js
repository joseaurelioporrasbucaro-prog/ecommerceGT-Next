/** @type {import('next').NextConfig} */
const nextConfig = {
  // Agregamos esta sección de images
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**', // Permite cualquier ruta dentro del puerto 4000
      },
      {
        // Backend en Render (producción). Habilita la optimización de imágenes
        // de Next (avatares, etc.) para que se vean nítidas.
        protocol: 'https',
        hostname: 'ecommercegtbackend-popl.onrender.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig; // O "export default nextConfig;" si es .mjs
