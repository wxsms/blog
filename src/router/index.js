import VueRouter from 'vue-router'

const routeNames = {
  HOME: 'home',
  ARCHIVE: 'archive',
  POST: 'post',
  TAGS: 'tags',
  TAG: 'tag',
  CATEGORIES: 'CATEGORIES',
  CATEGORY: 'CATEGORY',
  QUERY: 'query',
  QUERY_RESULT: 'queryResult',
  ABOUT: 'about',
  GUESTBOOK: 'guestbook',
  CV: 'cv',
  MOVIES: 'movies'
}

const routes = [
  {
    path: '/',
    name: routeNames.HOME,
    component: require('./../components/pages/Home.vue')
  },
  {
    path: '/p',
    name: routeNames.ARCHIVE,
    component: resolve => require(['./../components/pages/archive/Archive.vue'], resolve)
  },
  {
    path: '/p/:p',
    name: routeNames.POST,
    component: resolve => require(['./../components/pages/archive/Single.vue'], resolve)
  },
  {
    path: '/t',
    name: routeNames.TAGS,
    component: resolve => require(['./../components/pages/tags/Tags.vue'], resolve)
  },
  {
    path: '/t/:t',
    name: routeNames.TAG,
    component: resolve => require(['./../components/pages/tags/Single.vue'], resolve)
  },
  {
    path: '/c',
    name: routeNames.CATEGORIES,
    component: resolve => require(['./../components/pages/categories/Categories.vue'], resolve)
  },
  {
    path: '/c/:c',
    name: routeNames.CATEGORY,
    component: resolve => require(['./../components/pages/categories/Single.vue'], resolve)
  },
  {
    path: '/q',
    name: routeNames.QUERY,
    component: resolve => require(['./../components/pages/search/Search.vue'], resolve)
  },
  {
    path: '/q/:q',
    name: routeNames.QUERY_RESULT,
    component: resolve => require(['./../components/pages/search/Result.vue'], resolve)
  },
  {
    path: '/a',
    name: routeNames.ABOUT,
    component: resolve => require(['./../components/pages/About.vue'], resolve)
  },
  {
    path: '/m',
    name: routeNames.MOVIES,
    component: resolve => require(['./../components/pages/Movies.vue'], resolve)
  },
  {
    path: '/g',
    name: routeNames.GUESTBOOK,
    component: resolve => require(['./../components/pages/Guestbook.vue'], resolve)
  },
  {
    path: '/o/cv',
    name: routeNames.CV,
    component: resolve => require(['./../components/pages/Cv.vue'], resolve)
  },
  {
    path: '*',
    component: require('./../components/pages/NotFound.vue')
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

const buildTitle = (base, desc) => {
  let title = base
  if (desc) {
    title += ' - ' + desc
  }
  document.title = title
}

router.beforeEach((to, from, next) => {
  let store = router.app.$store
  let path = to.path
  switch (to.name) {
    case routeNames.POST:
      let id = path.replace('/p/', '')
      let postList = store.state.postList
      for (let i = 0, l = postList.length; i < l; i++) {
        let post = postList[i]
        if (post.meta && post.meta.id === id) {
          buildTitle(store.state.baseTitle, post.meta.title)
          break
        }
      }
      break
    case routeNames.ARCHIVE:
      buildTitle(store.state.baseTitle, '归档')
      break
    case routeNames.CATEGORIES:
      buildTitle(store.state.baseTitle, '目录')
      break
    case routeNames.CATEGORY:
      buildTitle(store.state.baseTitle, `目录 ${path.replace('/c/', '')}`)
      break
    case routeNames.TAGS:
      buildTitle(store.state.baseTitle, '标签')
      break
    case routeNames.TAG:
      buildTitle(store.state.baseTitle, `标签 ${path.replace('/t/', '')}`)
      break
    case routeNames.GUESTBOOK:
      buildTitle(store.state.baseTitle, '留言')
      break
    case routeNames.ABOUT:
      buildTitle(store.state.baseTitle, '关于')
      break
    case routeNames.MOVIES:
      buildTitle(store.state.baseTitle, '电影')
      break
    case routeNames.QUERY:
      buildTitle(store.state.baseTitle, '搜索')
      break
    case routeNames.QUERY_RESULT:
      buildTitle(store.state.baseTitle, '搜索结果')
      break
    default:
      buildTitle(store.state.baseTitle)
  }
  next()
})

export default router
