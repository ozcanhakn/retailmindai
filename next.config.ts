import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/analyze/:id",
        destination: "/analyze/:id",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
