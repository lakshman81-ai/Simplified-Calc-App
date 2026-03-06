import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Inject build timestamp for VersionBadge component
const buildTime = new Date().toISOString();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
})
