import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/': resolve(__dirname, 'src') + '/',
    },
  },
  build: {
    outDir: resolve(__dirname, '../assets/dist'), 
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      name: 'ProjectDocumentationApp',
      formats: ['umd'],
      fileName: () => 'doc-bundle.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'doc-styles.css';
          // return assetInfo.name;
          return assetInfo.name || 'assets/[name].[ext]'; 
        },
      }
    }
  },
  css: {
    postcss: './postcss.config.cjs',
  },
});