import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false, // 启用开发环境 PWA
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
})(nextConfig as any);
