import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// PORT is required for the dev server but not needed during `vite build`.
// Default to 5173 so external build environments don't need to set it.
const port = Number(process.env.PORT || "5173");

// BASE_PATH controls the Vite `base` option.  Default to "/" for standard
// single-origin deployments (Render, Railway, Docker, VPS, etc.).
const basePath = process.env.BASE_PATH || "/";

const isProduction = process.env.NODE_ENV === "production";

// Detect Replit workspace — only load Replit-specific plugins there.
const isReplit = process.env.REPL_ID !== undefined;

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    // Replit-specific dev plugins — skipped in production and outside Replit.
    // Dynamic imports prevent resolution errors on non-Replit build machines.
    ...(isReplit && !isProduction
      ? await Promise.all([
          import("@replit/vite-plugin-runtime-error-modal").then((m) =>
            m.default()
          ),
          import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            })
          ),
          import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
        ])
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
