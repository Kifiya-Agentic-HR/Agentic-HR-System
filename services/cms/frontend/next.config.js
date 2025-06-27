const nextConfig = {
  experimental: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  basePath: "/dashboard",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
        basePath: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
