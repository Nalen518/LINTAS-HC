/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Proxy to FastAPI per docs/API_CONTRACT.md — the frontend only ever
    // fetches /api/backend/*; never call the backend origin directly.
    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
