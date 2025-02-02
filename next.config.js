/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vnwfuvdbuwhvkiyiveaq.supabase.co',
        pathname: '/storage/v1/s3/attachments/**',
      },
    ],
  },
};

export default config;
