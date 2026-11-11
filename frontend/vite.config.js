import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://minimarket-backend-r4co.onrender.com",
        changeOrigin: true,
        secure: true
      }
    }
  }
});
