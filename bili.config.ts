import type { Config } from 'bili';

export default <Config> {
  input: 'src/index.ts',
  output: {
    moduleName: 'vuseRx',
    format: 'umd-min',
    fileName: 'umd.js',
    target: 'browser',
  },
  globals: {
    vue: 'Vue',
    rxjs: 'rxjs',
    'rxjs/operators': 'rxjs.operators',
  },
  plugins: {
    typescript2: true,
  },
  externals: ['vue', 'rxjs', 'rxjs/operators'],
};
