import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import fs from 'fs-extra';
import { exec } from 'child_process';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const aemHost = env?.VITE_HOST_URI ?? 'http://localhost:4502';
  return {
    base: command === 'build' ? '/etc.clientlibs/content-wizard/clientlibs/' : '/',
    /* BUILD */
    build: {
      reportCompressedSize: false,
      manifest: true,
      minify: mode === 'development' ? false : 'terser',
      outDir: 'dist',
      sourcemap: command === 'serve' ? 'inline' : true,

      rollupOptions: {
        output: {
          chunkFileNames: 'resources/static/js/[name].[hash].chunk.js',
          entryFileNames: 'js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            console.log('assetInfo.name: ', assetInfo.name);
            //console.log('assetInfo: ', assetInfo);
            if (/\.css$/.test(assetInfo.name ?? 'error')) {
              return 'css/[name].[hash][extname]';
            }
            if (/\.js$/.test(assetInfo.name ?? 'error')) {
              return 'js/[name].[hash][extname]';
            }
            return 'resources/[name].[hash][extname]';
          },
        },
        plugins: [
          // Plugin to generate .content.xml and txt files
          // Plugin to customize public asset paths
          {
            name: 'custom-public-dir',
            enforce: 'post',
            generateBundle(_options, bundle) {
              const publicDir = 'resources/static';
              const targetDir = resolve(__dirname, 'dist', publicDir);

              // Ensure target directory exists
              fs.ensureDirSync(targetDir);

              // Move assets from default location to custom location
              for (const fileName in bundle) {
                const asset = bundle[fileName];
                //console.log(`fileName: `, fileName);
                if (asset.type === 'asset') {
                  //const sourcePath = resolve(__dirname, 'dist', asset.fileName);
                  //const targetPath = resolve(targetDir, asset.fileName);
                  //console.log(`sourcePath: `, sourcePath);
                  //console.log(`targetPath: `, targetPath);
                  //fs.moveSync(sourcePath, targetPath, { overwrite: true });
                  // Update the asset path in the bundle
                  //delete bundle[fileName];
                  //bundle[`${publicDir}/${asset.fileName}`] = asset;
                } else {
                  //console.log(`not asset: `, fileName);
                }
              }
            },
          },
          {
            name: 'aem-clientlib-structure',
            generateBundle(_, bundle) {
              // Create .content.xml
              const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
            <jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
                jcr:primaryType="cq:ClientLibraryFolder"
                categories="[content-wizard.react]"
                allowProxy="{Boolean}true"
                cssProcessor="[default:none, min:none]"
                jsProcessor="[default:none, min:none]"
                />`;
              this.emitFile({
                type: 'asset',
                fileName: '.content.xml',
                source: contentXml,
              });

              // Collect and generate css.txt and js.txt files
              const cssFiles = [];
              const jsFiles = [];
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              for (const [fileName, _fileInfo] of Object.entries(bundle)) {
                //console.log(`fileName[${fileName}]: `, fileInfo.type);
                if (fileName.endsWith('.css') && !fileName.includes('chunk')) {
                  cssFiles.push(fileName.replace('css/', ''));
                }
                if (fileName.endsWith('.js') && !fileName.includes('chunk')) {
                  jsFiles.push(fileName.replace('js/', ''));
                }
              }

              const cssTxt = `#base=css\n${cssFiles.join('\n')}`;
              const jsTxt = `#base=js\n${jsFiles.join('\n')}`;

              this.emitFile({
                type: 'asset',
                fileName: 'css.txt',
                source: cssTxt,
              });
              this.emitFile({
                type: 'asset',
                fileName: 'js.txt',
                source: jsTxt,
              });
            },
          },
          {
            name: 'copy-dist-plugin',
            apply: 'build',
            buildEnd() {
              // Call the copy-dist.cjs script
              exec('node util/copy-dist.cjs', (err, stdout, stderr) => {
                if (err) {
                  console.error('Error executing copy-dist.cjs:', stderr);
                } else {
                  console.log('Copy-dist.js output:', stdout);
                }
              });
            },
          },
        ],
      },
    },
    /* PLUGINS */
    plugins: [tsconfigPaths(), svgr(), react({ tsDecorators: true })],
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
