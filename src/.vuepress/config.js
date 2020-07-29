module.exports = {
  title: `wxsm's space`,
  description: 'Just another personal blog.',
  ga: 'UA-102731925-1',
  head: [
    ['meta', { name: 'google-site-verification', content: 'ekuL5J7xK1IdFtP13v3KxpuGKnYS1oCT9PvZdjYm8Eg' }],
    ['link', { rel: 'shortcut icon', type: 'image/png', href: 'favicon.png' }],
    ['link', { rel: 'apple-touch-icon', size: '200x200', href: 'favicon-iphone.png' }],
    ['script', {
      'data-ad-client': 'ca-pub-4714899946256166',
      async: true,
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
    }]
  ],
  shouldPrefetch: function (filename) {
    // https://github.com/vuejs/vue/issues/7139
    return true
  },
  theme: 'mini',
  themeConfig: {
    siteName: 'wxsm\'s space',
    author: 'wxsm',
    navbar: true,
    nav: [
      { text: 'tech', link: '/tech' },
      { text: 'life', link: '/life' },
      { text: 'links', link: '/links' }
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
    '@vuepress/back-to-top': {},
    'flowchart': {}
  },
  markdown: {
    toc: {
      containerHeaderHtml: '<p>目录：</p>',
      containerFooterHtml: '<br/>'
    }
  }
}
