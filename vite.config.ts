import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      name: 'vuseRx',

      entry: 'src/index.ts',
      formats: ['umd'],
      fileName: () => 'umd.js'
    },

    sourcemap: true,

    rollupOptions: {
      output: {
        globals: {
          vue: 'Vue',
          rxjs: 'rxjs',
          'rxjs/operators': 'rxjs.operators',
        },
      },
      external: ['vue', 'rxjs', 'rxjs/operators'],
    }
  },
});
