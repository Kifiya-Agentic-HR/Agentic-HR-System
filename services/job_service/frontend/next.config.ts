import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
  },
  /* config options here */
  serverRuntimeConfig: {
    // Will only be available on the server side
    mySecret: 'secret',
    BASE_API_URL: process.env.NEXT_PUBLIC_BASE_API_URL, // Pass through env variables
  },
  async headers() {
    return [
      {
        source: '/(.*)', // Apply to all routes
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;