import { defineConfig } from 'vitepress'
import { SitemapStream } from 'sitemap';
import { resolve } from 'node:path';
import { createWriteStream } from 'node:fs';
import { name, description, version } from '../../package.json';

const links: Array<any> = [];

const isNext = version.includes('rc');

export default defineConfig({
  title: name,
  description: description,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo-small.svg' }],
    ['meta', { name: 'theme-color', content: '#3c8772' }]
  ],

  lastUpdated: true,

  cleanUrls: 'with-subfolders',

  useWebFonts: true,

  themeConfig: {
    siteTitle: false,
    logo: {
      src: '/logo-g.svg',
      alt: 'vuse-rx'
    },
    lastUpdatedText: 'Last Updated',

    nav: [
      {
        text: version,
        items: [
          // Always match if current version aligns with docs version
          { text: 'next', link: 'https://next.vuse-rx.raiondesu.dev', activeMatch: isNext ? '.' : '' },
          { text: 'stable', link: 'https://vuse-rx.raiondesu.dev', activeMatch: isNext ? '' : '.' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/raiondesu/vuse-rx' },
      { icon: { svg: '<svg viewBox="0 0 27.23 27.23"><rect fill="#333333" width="27.23" height="27.23" rx="2"></rect><polygon fill="#fff" points="5.8 21.75 13.66 21.75 13.67 9.98 17.59 9.98 17.58 21.76 21.51 21.76 21.52 6.06 5.82 6.04 5.8 21.75"></polygon></svg>' }, link: 'https://npmjs.com/vuse-rx' },
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
          { text: 'Shared counter', link: '/recipes/shared-counter' },
          { text: 'Stopwatch', link: '/recipes/stopwatch' },
        ]
      }
    ],

    editLink: {
      pattern: 'https://github.com/raiondesu/vuse-rx/edit/dev/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2021-present Alexey Iskhakov'
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
