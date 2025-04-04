import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ['tsx', 'mdx'],
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
