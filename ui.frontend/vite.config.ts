import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';
import { viteForAem } from '@aem-vite/vite-aem-plugin';

const LIB_ROOT = '/etc.clientlibs/content-wizard/clientlibs';
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log('Build Mode: ', mode);
  const aemHost = env?.VITE_PRIVATE_HOST_URI ?? env?.VITE_HOST_URI ?? 'http://localhost:4502';
  console.log('Proxy Host: ', aemHost);

  const plugins = [
    tsconfigPaths(),
    svgr({
      svgrOptions: { exportType: 'default', ref: true, svgo: false, titleProp: true },
      include: '**/*.svg',
    }),
    react({ tsDecorators: true }),
    visualizer(),
  ];
  if (command === 'build') {
    plugins.push(
      viteForAem({
        contentPaths: [],
        publicPath: LIB_ROOT + '/content-wizard',
      }),
    );
  }

  return {
    base: command === 'build' ? LIB_ROOT + '/' : '',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    /* PLUGINS */
    plugins,
    /* BUILD */
    build: {
      reportCompressedSize: false,
      manifest: false,
      minify: mode === 'development' ? false : 'terser',
      outDir: 'dist',
      sourcemap: command === 'serve' ? 'inline' : undefined,
      rollupOptions: {
        input: {
          bundle: 'src/main.tsx',
        },
        output: {
          assetFileNames: 'content-wizard/resources/[ext]/[name][extname]',
          chunkFileNames: 'content-wizard/resources/chunks/[name].[hash].js',
          entryFileNames: 'content-wizard/resources/js/[name].js',
        },
        plugins: [
          //nodeResolve(),
          // Plugin to generate .content.xml and txt files
          {
            name: 'aem-clientlib-structure',
            generateBundle(_, bundle) {
              // Create .content.xml
              const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
            <jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
                jcr:primaryType="cq:ClientLibraryFolder"
                categories="[content-wizard.app]"
                allowProxy="{Boolean}true"
                cssProcessor="[default:none, min:none]"
                jsProcessor="[default:none, min:none]"
                />`;
              this.emitFile({
                type: 'asset',
                fileName: `content-wizard/.content.xml`,
                source: contentXml,
              });

              // Collect and generate css.txt and js.txt files
              const cssFiles = [];
              const jsFiles = [];
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              for (const [fileName, _fileInfo] of Object.entries(bundle)) {
                console.log(`fileName[${fileName}]: `, _fileInfo.type);
                if (fileName.endsWith('.css') && !fileName.includes('chunk')) {
                  cssFiles.push(fileName.replace(`content-wizard/resources/css/`, ''));
                }
                if (fileName.endsWith('.js') && !fileName.includes('chunk')) {
                  jsFiles.push(fileName.replace(`content-wizard/resources/js/`, ''));
                }
              }

              const cssTxt = `#base=resources/css\n${cssFiles.join('\n')}`;
              const jsTxt = `#base=resources/js\n${jsFiles.join('\n')}`;

              this.emitFile({
                type: 'asset',
                fileName: `content-wizard/css.txt`,
                source: cssTxt,
              });
              this.emitFile({
                type: 'asset',
                fileName: `content-wizard/js.txt`,
                source: jsTxt,
              });
            },
          },
        ],
      },
    },
    /* SERVER */
    server: {
      port: 3000,
      strictPort: true,
      open: true,
      proxy: {
        '^/(bin|conf|content|crx|etc|graphql|libs)': {
          target: aemHost,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\//, ''),
        },
      },
    },
  };
});
