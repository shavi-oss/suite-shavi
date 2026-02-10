import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'modules/platform-admin/client',
  build: {
    outDir: '../../../dist/platform-admin/client',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api/platform-admin': {
        target: 'http://localhost:3001', // Assuming BFF runs on 3001
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  }
})
