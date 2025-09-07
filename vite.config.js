import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',   // if you had this before, keep it
  },
  optimizeDeps: {
    include: ['react-mathquill'],   // keep your deps
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    host: '0.0.0.0',        // allow connections from any IP
    port: 5173,             // or the port you want
    allowedHosts: [
      'test.campusprobd.com'  // 👈 your domain added here
    ],
  },
})
