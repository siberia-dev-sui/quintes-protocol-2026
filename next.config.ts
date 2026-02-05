import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // eslint config removed (deprecated)
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
