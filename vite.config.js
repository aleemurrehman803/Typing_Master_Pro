import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration
 * Configures the build tool and development server.
 * - Uses the React plugin for Fast Refresh and JSX support.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default port
    open: true, // Open browser on start
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
  build: {
    sourcemap: false, // SECURITY: Prevent code leakage in production (Section 1)
    minify: 'terser', // High-level minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove debug logs in production
        drop_debugger: true
      }
    }
  }
})
