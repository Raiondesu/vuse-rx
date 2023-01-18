import { defineConfig } from 'vite';
import { SearchPlugin } from 'vitepress-plugin-search';

export default defineConfig({
  plugins: [SearchPlugin({
    cache: true,
    encode: false,
    tokenize: 'full',
    previewLength: 62,
    buttonLabel: 'Search',
    placeholder: 'Search docs',
  })]
});
