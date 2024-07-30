import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const aemHost = env?.VITE_HOST_URI ?? 'http://localhost:4502';
  return {
    plugins: [tsconfigPaths(), svgr(), react({ tsDecorators: true })],
    server: {
      port: 3000,
      strictPort: true,
      open: true,
      proxy: {
        '^/(content|bin|crx|etc)': {
          target: aemHost,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\//, ''),
        },
      },
    },
  };
});
