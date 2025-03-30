import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add this to disable source maps
  build: {
    sourcemap: false, // Disables source maps in production builds
  },
  // Optional: Disable source maps in development too
  sourcemap: mode === "development" ? false : false, // Controls source maps for both dev and build
}));