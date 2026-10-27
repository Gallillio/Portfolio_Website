import type { NextConfig } from "next";

// Single Next config. next.config.js previously coexisted with an empty
// next.config.ts stub; Next resolves .ts first, so these remotePatterns were at
// risk of being silently inert — which would break the remote skill logos that
// components/about.tsx renders through next/image.
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
            {
                protocol: "https",
                hostname: "img.icons8.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cdn.jsdelivr.net",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "registry.npmmirror.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "www.edureka.co",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.icon-icons.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "i.pinimg.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "upload.wikimedia.org",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.seeklogo.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "d3njjcbhbojbot.cloudfront.net",
                pathname: "/**",
            },
        ],
  },
  // The project's slug moved to American spelling; keep the old URL working
  // for search engines and links already shared.
  async redirects() {
    return [
      {
        source: "/projects/data-visualiser-tool",
        destination: "/projects/data-visualizer-tool",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
