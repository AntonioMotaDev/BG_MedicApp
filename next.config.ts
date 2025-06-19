import type {NextConfig} from 'next';

// https://nextjs.org/docs/app/building-your-application/configuring/typescript

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // experimental: { // Usually enabled by default in recent Next.js versions
  //   serverActions: true, 
  // },
};

export default nextConfig;
