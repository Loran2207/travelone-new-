import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// TRAVEL1 prototype — plain client-side React SPA.
// `--host` (in the dev/preview scripts) exposes it on the LAN so you can
// open it on your phone at http://<your-computer-ip>:5173.
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
});
