const _ = require('lodash')

module.exports = {
  shouldPrefetch: () => false,
  title: `wxsm's space`,
  description: 'Just another personal blog.',
  head: [
    ['meta', { name: 'google-site-verification', content: 'ekuL5J7xK1IdFtP13v3KxpuGKnYS1oCT9PvZdjYm8Eg' }],
    ['link', { rel: 'shortcut icon', type: 'image/png', href: 'favicon.png' }],
    ['link', { rel: 'apple-touch-icon', size: '200x200', href: 'favicon-iphone.png' }]
    // ['script', {
    //   'data-ad-client': 'ca-pub-4714899946256166',
    //   async: true,
    //   src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
    // }]
  ],
  theme: 'mini',
  themeConfig: {
    // useSimpleLinkOnNavBar: true,
    // 这个平滑滚动是通过 css 实现的，会导致一些不必要的动画，较为烦人
    smoothScroll: false,
    lastUpdated: 'Last Updated',
    siteName: 'wxsm\'s space',
    author: 'wxsm',
    navbar: true,
    nav: [
      { text: 'tech', link: '/tech/' },
      { text: 'life', link: '/life/' },
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
  plugins: {
    'sitemap': {
      hostname: 'https://wxsm.space'
    },
    '@vuepress/google-analytics': {
      'ga': 'UA-102731925-1'
    },
    'flowchart': {},
    '@vuepress/back-to-top': {},
    'feed': {
      canonical_base: 'https://wxsm.space',
      posts_directories: ['/posts'],
      sort: entries => _.reverse(_.sortBy(entries, 'date'))
    }
    // 'vuepress-plugin-serve': {},
    // 'vuepress-plugin-dehydrate': {
    //   // disable SSR
    //   noSSR: '404.html',
    //   // remove scripts
    //   noScript: [
    //     // '**/2018-07-19-gitlab-ci-setup.html'
    //   ]
    // }
  },
  markdown: {
    // toc: {
    //   containerHeaderHtml: '<p>目录：</p>',
    //   containerFooterHtml: '<br/>'
    // },
    lineNumbers: false
  }
}
