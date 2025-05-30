// vite.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs/promises';
import svgr from '@svgr/rollup';

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
    alias: {
      src: resolve(process.cwd(), 'src'),
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'load-js-files-as-tsx',
          setup(build) {
            build.onLoad({ filter: /src\\.*\.js$/ }, async (args) => {
              return {
                loader: 'tsx',
                contents: await fs.readFile(args.path, 'utf8'),
              };
            });
          },
        },
      ],
    },
  },
  plugins: [svgr(), react()],
});
