const { name, description } = require('../../package.json');

module.exports = {
  title: name,
  description: description,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo-small.svg' }]],
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
  }
};

function getSidebar() {
  return [
    {
      text: 'Introduction',
      children: [
        { text: 'What is vuse-rx?', link: '/guide/', activeMatch: '^/guide/$' },
        { text: 'Getting Started', link: '/guide/getting-started' },
      ]
    },
    {
      text: 'API',
      children: [
        { text: 'useRxState', link: '/api/use-rx-state' },
        { text: 'Observable X Reactive', link: '/api/refs' },
        { text: 'Hooks', link: '/api/hooks' },
      ]
    },
    {
      text: 'Cookbook',
      children: [
        { text: 'Simple counter', link: '/recipes/counter' },
        { text: 'Stopwatch', link: '/recipes/stopwatch' },
      ]
    }
  ]
}
