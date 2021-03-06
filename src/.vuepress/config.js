const _ = require('lodash')

module.exports = {
  title: `wxsm's space`,
  description: 'Just another personal blog.',
  head: [
    ['meta', { name: 'google-site-verification', content: 'ekuL5J7xK1IdFtP13v3KxpuGKnYS1oCT9PvZdjYm8Eg' }],
    ['link', { rel: 'shortcut icon', type: 'image/png', href: 'favicon.png' }],
    ['link', { rel: 'apple-touch-icon', size: '200x200', href: 'favicon-iphone.png' }]
  ],
  theme: 'mini',
  themeConfig: {
    hostname: 'https://wxsm.space',
    ga: 'UA-102731925-1',
    smoothScroll: false,
    lastUpdated: 'Last Updated',
    siteName: 'wxsm\'s space',
    author: 'wxsm',
    navbar: true,
    nav: [
      { text: 'home', link: '/' },
      { text: 'projects', link: '/projects/' },
      { text: 'about', link: '/about/' },
      { text: 'links', link: '/links/' }
    ],
    valine: {
      appId: 'PXFnynf8h6Qnpm9cIWT0BMgG-gzGzoHsz',
      appKey: 'GshYVR9jngnBj94to63biynJ',
      placeholder: 'Leave a comment...',
      verify: false,
      notify: false,
      avatar: 'retro',
      lang: 'en'
    }
  },
  markdown: {
    lineNumbers: false,
    extendMarkdown: md => {
      md.use(require('markdown-it-imsize'))
    }
  }
}
