import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration
 * Configures the build tool and development server.
 * - Uses the React plugin for Fast Refresh and JSX support.
 */
export default defineConfig({
  plugins: [react()],
  base: '/Typing_Master_Pro/', // MANDATORY: Required for GitHub Pages deployment
  server: {
    port: 5173,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) {
              return 'recharts';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            if (id.includes('crypto-js')) {
              return 'crypto';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
