import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// The site renders the prototype's real components (@app) and the generated color tokens (@tokens),
// both copied into vendor/ by `npm run sync`.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "vendor/loan-app/src"),
      "@tokens": path.resolve(__dirname, "vendor/tokens"),
    },
    // One copy of each runtime, even for files imported from the prototype folder.
    dedupe: ["react", "react-dom", "motion", "lucide-react", "clsx", "zod", "react-hook-form", "@hookform/resolvers"],
  },
  server: { port: 5180, strictPort: true },
  build: { assetsInlineLimit: 200_000, cssCodeSplit: false },
});
