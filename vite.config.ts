import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'Sindhu Hospitals',
          short_name: 'Sindhu',
          description:
            'Appointments, reports, prescriptions and billing for Sindhu Hospitals, HITEC City, Hyderabad.',
          lang: 'en-IN',
          start_url: '/',
          scope: '/',
          id: '/',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#0F5C5A',
          background_color: '#FAF8F4',
          categories: ['medical', 'health'],
          icons: [
            {src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
            {src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
            {src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
          ],
          shortcuts: [
            {name: 'Book appointment', url: '/?tab=care', icons: [{src: '/icon-192.png', sizes: '192x192'}]},
            {name: 'My reports', url: '/?tab=records', icons: [{src: '/icon-192.png', sizes: '192x192'}]},
          ],
        },
        workbox: {
          // Doctor photos are copied to dist/src/assets by the plugin above; precache them
          // so the app (and photos) work fully offline after first load.
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,jpg,jpeg,webp}'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
        },
      }),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
