import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/flic-english-website/',
  server: {
    host: true, // Cho phep lang nghe tat ca cac IP (0.0.0.0)
    allowedHosts: true, // Cho phep ngrok hoac bat ky ten mien nao truy cap
  }
})