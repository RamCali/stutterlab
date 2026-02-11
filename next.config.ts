import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/ai-stuttering-therapy",
        destination: "/ai-speech-training",
        permanent: true,
      },
      {
        source: "/stuttering-therapy-app",
        destination: "/stuttering-practice-app",
        permanent: true,
      },
      {
        source: "/stuttering-treatment",
        destination: "/stuttering-program",
        permanent: true,
      },
      {
        source: "/speech-therapy-for-stuttering",
        destination: "/speech-training-for-stuttering",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
