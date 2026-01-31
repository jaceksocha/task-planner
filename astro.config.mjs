// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import cloudflare from "@astrojs/cloudflare";

// Determine which adapter to use based on environment
// Set DEPLOY_TARGET=cloudflare for production builds
// eslint-disable-next-line no-undef
const isCloudflare = typeof process !== "undefined" && process.env.DEPLOY_TARGET === "cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: isCloudflare
    ? cloudflare({
        platformProxy: {
          enabled: true,
        },
      })
    : node({
        mode: "standalone",
      }),
});
