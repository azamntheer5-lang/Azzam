import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Required for Prisma on Vercel — handles binary correctly
  serverExternalPackages: ["@prisma/client", "@node-rs/argon2", "bcryptjs"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow Next.js to bundle large libraries
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
