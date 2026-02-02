import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config is intentionally minimal for easy scaling.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
