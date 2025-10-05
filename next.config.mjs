import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      }
    ]
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      html2canvas: path.resolve(process.cwd(), "node_modules/html2canvas-pro"),
    };
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        html2canvas: "html2canvas-pro",
      },
    },
  },
};

export default nextConfig;
