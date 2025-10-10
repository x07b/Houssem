import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const basePath = process.env.VITE_BASE_PATH ?? "/"; // or just "/"

  return {
    base: basePath,
    server: {
      host: "::",
      port: 8080,
      fs: {
        // Allow project root so Vite can serve index.html, plus client/shared
        allow: [
          path.resolve(__dirname, "."),
          path.resolve(__dirname, "client"),
          path.resolve(__dirname, "shared"),
        ],
        deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
      },
      hmr: { overlay: false },
    },
    build: {
      // Use "dist" unless you also change Vercel Output Directory to "dist/spa"
      outDir: "dist",
    },
    plugins: [react(), expressPlugin()],
    define: {
      'import.meta.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
      'import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
  };
});

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // dev only
    async configureServer(server) {
      // Lazy import so it’s not evaluated during build
      const { createServer } = await import("./server");
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}
