import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'SnakeGameEngine',
      fileName: 'main',
      formats: ['es', 'umd']
    },
    sourcemap: true,
    minify: 'esbuild'
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    })
  ]
});
