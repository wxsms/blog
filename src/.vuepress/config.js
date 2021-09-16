const evergreen = process.env.NODE_ENV === 'development'

console.log('evergreen:', evergreen)

module.exports = {
  evergreen: evergreen,
  title: `wxsm's space`,
  description: 'wxsm 的个人网站',
  // shouldPrefetch: () => false,
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
    lastUpdated: '最后更新于',
    siteName: 'wxsm\'s space',
    author: 'wxsm',
    navbar: true,
    nav: [
      { text: '主页', link: '/' },
      { text: '项目', link: '/projects/' },
      { text: '关于', link: '/about/' },
      { text: '友链', link: '/links/' }
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
  }
}
