import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    svgr({
      svgrOptions: { exportType: 'default', ref: true, svgo: false, titleProp: true },
      include: '**/*.svg',
    }),
    react({ tsDecorators: true }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    server: {
      // MUI 9's ESM build (e.g. @mui/material/internal/Transition.mjs) does a directory
      // import of `react-transition-group/TransitionGroupContext` that Node's ESM resolver
      // rejects. Inlining these forces Vite to transform/resolve them instead of Node.
      deps: {
        inline: [/@mui\//, 'react-transition-group'],
      },
    },
  },
});
