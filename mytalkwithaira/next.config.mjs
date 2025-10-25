/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Explicitly set the root directory to resolve workspace detection issues
  experimental: {
    turbopack: {
      root: process.cwd(),
    },
  },
}

export default nextConfig
