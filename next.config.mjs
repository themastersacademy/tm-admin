/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Basic redirect
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
  images: {
    domains: [
      "tma-dev-resource.s3.ap-south-1.amazonaws.com",
      "lh3.googleusercontent.com",
    ],
  },
};

export default nextConfig;
