const package = require('../../package.json');

module.exports = {
  title: package.name,
  description: package.description,
  themeConfig: {
    repo: 'raiondesu/vuse-rx',
    docsDir: 'docs',

    lastUpdated: 'Last Updated',

    nav: [
      {
        text: 'NPM',
        link: 'https://npmjs.com/vuse-rx'
      }
    ],

    sidebar: getSidebar(),
  },
  markdown: {
    // options for markdown-it-anchor
    anchor: { permalink: false },

    // options for markdown-it-toc
    toc: { includeLevel: [1, 2] },
  }
};

function getSidebar() {
  return [
    {
      text: 'Introduction',
      children: [
        { text: 'What is vuse-rx?', link: '/guide/', activeMatch: '^/guide/$' },
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'State Management', link: '/guide/state' },
      ]
    },
    {
      text: 'API',
      children: [
        { text: 'useRxState', link: '/api/use-rx-state' },
        { text: 'useSubject', link: '/api/use-subject' },
        { text: 'Reacive refs', link: '/api/refs' },
        { text: 'Hooks', link: '/api/hooks' },
      ]
    },
    {
      text: 'Cookbook',
      children: [
        { text: 'Simple counter', link: '/recipies/counter' },
        { text: 'Stopwatch', link: '/recipies/stopwatch' },
      ]
    }
  ]
}
