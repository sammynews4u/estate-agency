import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel optimized standalone output
  output: "standalone",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },

  // pg driver needs to stay external in serverless
  serverExternalPackages: ["pg"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
