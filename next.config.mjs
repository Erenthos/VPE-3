/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // IMPORTANT: your app CANNOT be statically exported
  // because it uses NextAuth, API routes, Prisma, PDF generation, etc.
  output: undefined,

  experimental: {
    serverActions: true
  }
};

export default nextConfig;
