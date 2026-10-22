import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      esbuild: 'esbuild-wasm'
    }
  },
  server: {
    port: 5173,
    open: false
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    minify: true,
    cssMinify: true
  }
});
