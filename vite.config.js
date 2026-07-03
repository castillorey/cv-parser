import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/cv-parser/",
  server: {
    proxy: {
      "/api/openrouter": {
        target: "https://openrouter.ai",
        changeOrigin: true,
        rewrite: (p) => p.replace("/api/openrouter", ""),
      },
    },
  },
});
