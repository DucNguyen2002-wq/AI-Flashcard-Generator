import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdf-parse"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zgdgwdwgxoavfjhjosjf.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      // Unsplash CDN – dùng cho ảnh minh họa trên landing page
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
