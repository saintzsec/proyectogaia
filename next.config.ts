import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fotos de evidencia vía Server Action (límite bajo provoca "Failed to fetch" en imágenes grandes).
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};

export default nextConfig;
