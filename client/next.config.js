/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env:{
    NEXT_PUBLIC_ZEGO_APP_ID:1937499763,
    NEXT_PUBLIC_ZEGO_SERVER_ID:"36c848819a1e6ba557816cdae380679d",
    NEXT_PUBLIC_BACKEND_URL: "http://localhost:3005",
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3005",
        pathname: "/uploads/images/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};
module.exports = nextConfig;