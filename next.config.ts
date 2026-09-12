import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, which most phone photos alone exceed — the news
      // article form submits a featured image file plus the rich text
      // body through a Server Action in one request.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
