import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  basePath: "/Make-my-trip",
  assetPrefix: "/Make-my-trip/",
};

export default nextConfig;