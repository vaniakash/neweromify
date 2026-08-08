import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "mammoth", "cloudinary"],
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Force canonical domain: www.eromify.in is Vercel primary
  // Ensures no redirect chain — non-www already redirects via Vercel
  // If you switch Vercel primary to eromify.in, remove this block
  async redirects() {
    return [
      {
        source: "/auth/login",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/auth/signup",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/auth/forgot-password",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/auth/reset-password",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/tools/creator/video-generator",
        destination: "/video-generation",
        permanent: true,
      },
    ];
  },
  /**
   * Rewrites — map OAuth/MCP paths that Claude constructs from the issuer URL
   * to the real Next.js route handlers.
   *
   * Claude builds token URL as {issuer}/token instead of reading token_endpoint.
   * Claude builds authorize URL as {issuer}/authorize instead of reading authorization_endpoint.
   * Both are handled by rewrites here so no self-calling proxy is needed.
   */
  async rewrites() {
    return [
      // Claude calls {issuer}/token — rewrite to our real token handler
      {
        source: "/token",
        destination: "/api/oauth/token",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

