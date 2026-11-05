import crypto from 'node:crypto';

if (typeof crypto.getRandomValues !== 'function' && crypto.webcrypto) {
  crypto.getRandomValues = (arr) => crypto.webcrypto.getRandomValues(arr);
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ], 
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
