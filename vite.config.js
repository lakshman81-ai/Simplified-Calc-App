import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Inject build timestamp for VersionBadge component
const buildTime = new Date().toISOString();

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL || '/',
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_URL || '/',
  define: {
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
})
