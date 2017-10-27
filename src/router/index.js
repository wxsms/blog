import VueRouter from 'vue-router'
import NProgress from 'nprogress'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 250,
  minimum: 0.15
})

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
    component: () => import('./../components/pages/Home.vue')
  },
  {
    path: '/p',
    name: routeNames.ARCHIVE,
    component: () => import('./../components/pages/archive/Archive.vue')
  },
  {
    path: '/p/:p',
    name: routeNames.POST,
    component: () => import('./../components/pages/archive/Single.vue')
  },
  {
    path: '/t',
    name: routeNames.TAGS,
    component: () => import('./../components/pages/tags/Tags.vue')
  },
  {
    path: '/t/:t',
    name: routeNames.TAG,
    component: () => import('./../components/pages/tags/Single.vue')
  },
  {
    path: '/c',
    name: routeNames.CATEGORIES,
    component: () => import('./../components/pages/categories/Categories.vue')
  },
  {
    path: '/c/:c',
    name: routeNames.CATEGORY,
    component: () => import('./../components/pages/categories/Single.vue')
  },
  {
    path: '/q',
    name: routeNames.QUERY,
    component: () => import('./../components/pages/search/Search.vue')
  },
  {
    path: '/q/:q',
    name: routeNames.QUERY_RESULT,
    component: () => import('./../components/pages/search/Result.vue')
  },
  {
    path: '/a',
    name: routeNames.ABOUT,
    component: () => import('./../components/pages/About.vue')
  },
  {
    path: '/m',
    name: routeNames.MOVIES,
    component: () => import('./../components/pages/Movies.vue')
  },
  {
    path: '/g',
    name: routeNames.GUESTBOOK,
    component: () => import('./../components/pages/Guestbook.vue')
  },
  {
    path: '/o/cv',
    name: routeNames.CV,
    component: () => import('./../components/pages/Cv.vue')
  },
  {
    path: '*',
    component: require('./../components/pages/NotFound.vue')
  }
]

const router = new VueRouter({
  routes,
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash
      }
    } else if (savedPosition) {
      return savedPosition
    } else {
      return {x: 0, y: 0}
    }
  }
})

const buildTitle = (base, desc) => {
  let title = base
  if (desc) {
    title += ' - ' + desc
  }
  document.title = title
}

router.beforeEach((to, from, next) => {
  // Start progressbar
  NProgress.start()
  next()
})

router.afterEach((to, from) => {
  // Finish progress
  NProgress.done()
  // Build page title
  let store = router.app.$store
  let path = to.path
  switch (to.name) {
    case routeNames.POST:
      let id = path.replace('/p/', '')
      let postList = store.state.postList
      for (let i = 0, l = postList.length; i < l; i++) {
        let post = postList[i]
        if (post.id === id) {
          buildTitle(store.state.baseTitle, post.title)
          break
        }
      }
      break
    case routeNames.ARCHIVE:
      buildTitle(store.state.baseTitle, 'Archive')
      break
    case routeNames.CATEGORIES:
      buildTitle(store.state.baseTitle, 'Categories')
      break
    case routeNames.CATEGORY:
      buildTitle(store.state.baseTitle, `Category ${path.replace('/c/', '')}`)
      break
    case routeNames.TAGS:
      buildTitle(store.state.baseTitle, 'Tags')
      break
    case routeNames.TAG:
      buildTitle(store.state.baseTitle, `Tag ${path.replace('/t/', '')}`)
      break
    case routeNames.GUESTBOOK:
      buildTitle(store.state.baseTitle, 'Guestbook')
      break
    case routeNames.ABOUT:
      buildTitle(store.state.baseTitle, 'About')
      break
    case routeNames.MOVIES:
      buildTitle(store.state.baseTitle, 'Movies')
      break
    case routeNames.QUERY:
      buildTitle(store.state.baseTitle, 'Search')
      break
    case routeNames.QUERY_RESULT:
      buildTitle(store.state.baseTitle, 'Search Results')
      break
    default:
      buildTitle(store.state.baseTitle)
  }
})

export default router
