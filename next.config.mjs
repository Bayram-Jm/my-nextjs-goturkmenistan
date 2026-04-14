/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.figma.com",
        pathname: "/api/mcp/asset/**",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },

  async headers() {
    const adminHeaders = [
      // Clickjacking protection
      { key: "X-Frame-Options",           value: "DENY" },
      // MIME-sniffing protection
      { key: "X-Content-Type-Options",    value: "nosniff" },
      // Referrer policy
      { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
      // Permissions policy — disable unneeded browser features
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      // Content Security Policy
      // Note: unsafe-inline + unsafe-eval are required by Next.js 14 hydration.
      // Tighten with nonce-based CSP after upgrading to Next.js 15+.
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
          "font-src 'self'",
          "connect-src 'self'",
          "frame-ancestors 'none'",
        ].join("; "),
      },
    ];

    return [
      { source: "/admin/:path*",  headers: adminHeaders },
      { source: "/api/admin/:path*", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
      ]},
    ];
  },
};

export default nextConfig;
