import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const scriptTagRelocate = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html: string) {
      html = html.replace(`type="module" crossorigin`, '');
      const scriptTag = html.match(/<script[^>]*>(.*?)<\/script[^>]*>/)?.[0] || '';
      console.log('\n SCRIPT TAG', scriptTag, '\n');
      html = html.replace(scriptTag, '').replace('<!-- APP -->', scriptTag);
      return html;
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), svgr(), react({ tsDecorators: true }), scriptTagRelocate()],
  test: {
    globals: true,
    environment: 'jsdom',
    //setupFiles: './src/setupTests.ts',
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: [],
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
