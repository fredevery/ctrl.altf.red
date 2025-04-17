import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  // serverExternalPackages: ["canvas"],
  /* config options here */
  compiler: {},
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
