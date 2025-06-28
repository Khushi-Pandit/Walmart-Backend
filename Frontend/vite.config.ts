import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/olamaps': {
        target: 'https://api.olamaps.com', // Your actual backend server
        changeOrigin: true,
        rewrite: path => path.replace(/^\/olamaps/, '/olamaps'),
      }
    }
  },
});
