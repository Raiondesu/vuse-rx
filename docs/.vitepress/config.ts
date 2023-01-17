import { name, description } from '../../package.json';
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: name,
  description: description,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo-small.svg' }]],
  lastUpdated: true,

  themeConfig: {
    logo: {
      src: '/logo-g.svg',
      alt: 'vuse-rx'
    },
    lastUpdatedText: 'Last Updated',

    nav: [
      {
        text: 'NPM',
        link: 'https://npmjs.com/vuse-rx'
      }
    ],

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
  }
});
