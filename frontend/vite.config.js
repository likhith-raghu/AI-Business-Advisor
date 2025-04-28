import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: './',
  publicDir: 'public',
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'html/login.html'),
        signup: resolve(__dirname, 'html/signup.html'),
        dashboard: resolve(__dirname, 'html/dashboard.html')
      }
    }
  }
})