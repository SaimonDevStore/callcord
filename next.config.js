/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para Railway
  experimental: {
    serverComponentsExternalPackages: [],
    serverActions: {
      allowedOrigins: ['localhost:3000', 'callcord.vercel.app', '*.onrender.com', '*.railway.app'],
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
