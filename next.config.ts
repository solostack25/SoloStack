import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // make sure the bundled preview-card fonts ship with the /api/og function
  outputFileTracingIncludes: { "/api/og": ["./assets/fonts/**"] },
};

export default nextConfig;
