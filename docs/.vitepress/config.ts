import { defineConfig } from 'vitepress'
import { SitemapStream } from 'sitemap';
import { SearchPlugin } from 'vitepress-plugin-search';
import { resolve } from 'node:path';
import { createWriteStream } from 'node:fs';
import { name, description } from '../../package.json';

const links: Array<any> = [];

export default defineConfig({
  title: name,
  description: description,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo-small.svg' }]],
  lastUpdated: true,

  cleanUrls: 'without-subfolders',

  mpa: true,
  useWebFonts: true,

  // vite: {
  //   plugins: [SearchPlugin({
  //     cache: true,
  //     encode: false,
  //     tokenize: 'full',
  //     previewLength: 62,
  //     buttonLabel: 'Search',
  //     placeholder: 'Search docs',
  //   })]
  // },

  themeConfig: {
    siteTitle: false,
    logo: {
      src: '/logo-g.svg',
      alt: 'vuse-rx'
    },

    nav: [
      {
        text: 'NPM',
        link: 'https://npmjs.com/vuse-rx'
      }
    ],

    lastUpdatedText: 'Last Updated',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/raiondesu/vuse-rx' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is vuse-rx?', link: '/guide/' },
          { text: 'Getting Started', link: '/guide/getting-started' },
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'State Management', link: '/api/use-rx-state' },
          { text: 'Observable X Reactive', link: '/api/refs' },
          { text: 'Operators', link: '/api/operators' },
          { text: 'Hooks', link: '/api/hooks' },
        ]
      },
      {
        text: 'Cookbook',
        items: [
          { text: 'Simple counter', link: '/recipes/counter' },
          { text: 'Stopwatch', link: '/recipes/stopwatch' },
        ]
      }
    ],

    editLink: {
      pattern: 'https://github.com/raiondesu/vuse-rx/edit/dev/docs/:path',
      text: 'Edit this page on GitHub'
    }
  },

  // Sitemap solution by @brc-dd from https://github.com/vuejs/vitepress/issues/520#issuecomment-1301729595
  transformHtml: (_, id, { pageData }) => {
    if (!/[\\/]404\.html$/.test(id))
      links.push({
        url: pageData.relativePath.replace(/((^|\/)index)?\.md$/, '$2'),
        lastmod: pageData.lastUpdated
      })
  },

  buildEnd: ({ outDir }) => {
    const sitemap = new SitemapStream({
      hostname: 'https://vuse-rx.raiondesu.dev/'
    });
    const writeStream = createWriteStream(resolve(outDir, 'sitemap.xml'));
    sitemap.pipe(writeStream);
    links.forEach((link) => sitemap.write(link));
    sitemap.end();

    return new Promise((r) => writeStream.on('finish', r));
  }
  //


});
