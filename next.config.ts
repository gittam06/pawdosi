import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All user media is served from Cloudinary; nothing else is allowed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // Fail the production build on type errors rather than shipping them.
  // (Linting is a separate step: `npm run lint`.)
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
