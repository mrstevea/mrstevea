/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Prisma and sharp must be bundled as external modules in the Node.js runtime
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

module.exports = nextConfig;
