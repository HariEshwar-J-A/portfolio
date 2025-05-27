import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { imagePresets } from 'vite-plugin-image-presets';
import critical from 'vite-plugin-critical';
import splitVend from 'vite-plugin-splitvend';

export default defineConfig({
  plugins: [
    react(),
    imagePresets({
      thumbnail: {
        resize: {
          width: 300,
          height: 300,
          fit: 'cover',
        },
        format: 'webp',
        quality: 80,
      },
      hero: {
        resize: {
          width: 1200,
          height: 800,
          fit: 'cover',
        },
        format: ['avif', 'webp'],
        quality: 90,
      },
    }),
    critical({
      criticalCSS: {
        base: 'dist/',
        inline: true,
        dimensions: [
          {
            height: 900,
            width: 375,
          },
          {
            height: 900,
            width: 1200,
          },
        ],
      },
    }),
    splitVend(),
  ],
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-saga'],
          'ui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'visualization': ['d3', 'plotly.js', 'react-plotly.js'],
          'animation': ['framer-motion'],
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          
          const extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    copyPublicDir: true,
  },
  publicDir: 'public',
});