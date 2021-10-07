const evergreen = process.env.NODE_ENV === 'development'

console.log('evergreen:', evergreen)

module.exports = {
  evergreen: evergreen,
  title: `wxsm's space`,
  description: 'wxsm 的个人网站',
  shouldPrefetch: (name) => {
    return name.includes('vendors~') || name.includes('layout-')
  },
  head: [
    ['meta', { name: 'google-site-verification', content: 'ekuL5J7xK1IdFtP13v3KxpuGKnYS1oCT9PvZdjYm8Eg' }],
    ['link', { rel: 'shortcut icon', type: 'image/png', href: '/favicon.png' }],
    ['link', { rel: 'apple-touch-icon', size: '200x200', href: '/favicon-iphone.png' }],
    // ['link', { rel: 'icon', href: '/favicon-iphone.png' }],
    // ['link', { rel: 'manifest', href: '/manifest.json' }],
    // ['meta', { name: 'theme-color', content: '#ffffff' }],
    // ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    // ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    // ['link', { rel: 'apple-touch-icon', href: '/favicon-iphone.png' }],
    // ['meta', { name: 'msapplication-TileImage', content: '/favicon-iphone.png' }],
    // ['meta', { name: 'msapplication-TileColor', content: '#000000' }]
  ],
  // plugins: ['@vuepress/pwa', {
  //   serviceWorker: true,
  //   updatePopup: true
  // }],
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
      { text: '归档', link: '/archive/' },
      { text: '项目', link: '/projects/' },
      { text: '关于', link: '/about/' },
      { text: '友链', link: '/links/' }
    ],
    comment: {
      serverURL: 'https://blog-api-8pvwfy3l9-wxsms.vercel.app',
      avatar: 'retro',
      visitor: true,
      uploadImage: false,
      copyright: false
    }
  },
  markdown: {
    lineNumbers: false,
  }
}
