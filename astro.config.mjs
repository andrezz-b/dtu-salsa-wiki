import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import sharp from "sharp";
import config from "./src/config/config.json";

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url ? config.site.base_url : "http://examplesite.com",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: config.site.trailing_slash ? "always" : "never",
  vite: { plugins: [tailwindcss()] },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes("/admin/"),
    }),
    mdx(),
    AstroPWA({
      registerType: "autoUpdate",
      manifest: {
        name: "DTU Salsa Wiki",
        short_name: "Salsa Wiki",
        description: "A wiki for DTU Salsa",
        theme_color: "#000000",
        background_color: "#FFFFFF",
        icons: [
          {
            src: "/favicon/pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "/favicon/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/favicon/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/404",
        globPatterns: ["**/*.{css,js,html,svg,png,ico,txt}"],
        navigateFallbackDenylist: [/^\/admin/],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    shikiConfig: { theme: "one-dark-pro", wrap: true },
    extendDefaultPlugins: true,
  },
});
