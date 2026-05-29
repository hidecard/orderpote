import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: ['5173-ixamdxxxumvjskq2g2ukh-7c19b7db.us1.manus.computer', 'localhost', '127.0.0.1'],
  },
  optimizeDeps: {
    include: ['bcryptjs'],
  },
})
