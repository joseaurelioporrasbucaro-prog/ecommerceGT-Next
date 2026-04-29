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
    ],
  },
};

module.exports = nextConfig; // O "export default nextConfig;" si es .mjs
