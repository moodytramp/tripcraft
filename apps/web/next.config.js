/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@tripcraft/ui',
    '@tripcraft/types',
    '@tripcraft/i18n',
    '@tripcraft/api-client',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
