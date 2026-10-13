import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 solo sirve las calidades listadas: 90 para la fachada del Hero.
    qualities: [75, 90],
  },
};

export default nextConfig;
