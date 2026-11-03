import type { NextConfig } from "next";

// Single Next config. next.config.js previously coexisted with an empty
// next.config.ts stub; Next resolves .ts first, so these remotePatterns were at
// risk of being silently inert — which would break the remote skill logos that
// components/about.tsx renders through next/image.
const nextConfig: NextConfig = {
  images: {
    // Exact paths, not "/**": several of these hosts serve files anyone can
    // publish (any npm package or GitHub repo on jsDelivr, user uploads on
    // Pinterest, an open image proxy on Coursera's CloudFront). With "/**" the
    // site's optimizer would fetch and transform any image a stranger names, on
    // this project's image quota. Add a pattern here when adding a remote image.
    remotePatterns: [
      { protocol: "https", hostname: "img.icons8.com", pathname: "/color/96/**" },
      { protocol: "https", hostname: "img.icons8.com", pathname: "/fluency/96/**" },
      { protocol: "https", hostname: "cdn.jsdelivr.net", pathname: "/gh/devicons/devicon/icons/**" },
      { protocol: "https", hostname: "cdn.jsdelivr.net", pathname: "/gh/devicons/devicon@latest/icons/**" },
      { protocol: "https", hostname: "registry.npmmirror.com", pathname: "/@lobehub/icons-static-png/latest/files/dark/v0.png" },
      { protocol: "https", hostname: "www.edureka.co", pathname: "/blog/wp-content/uploads/2019/07/ScrumLogo-293x300.png" },
      { protocol: "https", hostname: "images.icon-icons.com", pathname: "/3911/PNG/512/credly_logo_icon_247258.png" },
      { protocol: "https", hostname: "i.pinimg.com", pathname: "/originals/12/f6/ac/12f6accc21f3cad0047fc68fc282569c.gif" },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/thumb/2/25/Microsoft_icon.svg/2048px-Microsoft_icon.svg.png",
      },
      { protocol: "https", hostname: "images.seeklogo.com", pathname: "/logo-png/34/2/comptia-logo-png_seeklogo-348934.png" },
      {
        protocol: "https",
        hostname: "d3njjcbhbojbot.cloudfront.net",
        pathname:
          "/api/utilities/v1/imageproxy/http://coursera-university-assets.s3.amazonaws.com/b4/5cb90bb92f420b99bf323a0356f451/Icon.png",
      },
    ],
    // Only the default quality is ever requested. Unset, any q from 1 to 100 is
    // accepted, which multiplies every source image into 100 cached variants.
    qualities: [75],
  },
  // Security headers for every route. The site never frames itself, so no
  // other page may frame it either (clickjacking, and reaching the window
  // message listeners from a hostile parent).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
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
