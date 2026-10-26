import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

const analyze = process.env.ANALYZE === '1';

/**
 * Heavy libraries stay in their own chunks. Plotly, MUI, three, and chess
 * are reached only through dynamic import(), so they are not part of the
 * initial `/` download. Other node_modules stay with the chunk that imports
 * them, so Plotly's dependencies are not pulled into the home entry.
 */
const manualChunks = (id: string): string | undefined => {
  // Keep Vite's preload helper out of the three chunk. If it lands there,
  // index.html modulepreloads the entire WebGL bundle on `/`.
  if (id.includes('preload-helper')) return 'preload';
  if (!id.includes('node_modules')) return undefined;
  if (id.includes('plotly.js') || id.includes('react-plotly.js')) return 'plotly';
  if (
    id.includes('/three/') ||
    id.includes('@react-three') ||
    id.includes('postprocessing')
  ) {
    return 'three';
  }
  if (
    id.includes('@mui') ||
    id.includes('@emotion') ||
    id.includes('popperjs') ||
    id.includes('react-transition-group')
  ) {
    return 'mui';
  }
  if (id.includes('chess.js') || id.includes('stockfish')) return 'chess';
  if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
    return 'motion';
  }
  if (
    id.includes('@reduxjs') ||
    id.includes('react-redux') ||
    id.includes('redux-saga') ||
    id.includes('/redux/') ||
    id.includes('immer') ||
    id.includes('reselect')
  ) {
    return 'redux';
  }
  if (
    /node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//.test(id)
  ) {
    return 'react';
  }
  return undefined;
};

export default defineConfig({
  plugins: [
    react(),
    analyze &&
      visualizer({
        filename: 'dist/bundle-stats.json',
        template: 'raw-data',
        gzipSize: true,
      }),
  ].filter(Boolean) as PluginOption[],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks,
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';

          const extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
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
