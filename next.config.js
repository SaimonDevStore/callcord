/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para Railway
  experimental: {
    serverComponentsExternalPackages: [],
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'localhost:3002', 'callcord.vercel.app', '*.onrender.com', '*.railway.app'],
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    domains: [
      'utfs.io',
      'img.clerk.com',
      'images.clerk.dev',
      'uploadthing.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Forçar serialização estrita
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'socket.io': 'commonjs socket.io',
        'socket.io-client': 'commonjs socket.io-client',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
