import VueRouter from 'vue-router'
import NProgress from 'nprogress'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 250,
  minimum: 0.15
})

const routeNames = {
  HOME: 'Home',
  ARCHIVE: 'Archive',
  POST: 'Post',
  TAGS: 'Tags',
  TAG: 'Tag',
  CATEGORIES: 'Categories',
  CATEGORY: 'Category',
  QUERY: 'Search',
  QUERY_RESULT: 'Search Results',
  ABOUT: 'About',
  GUESTBOOK: 'Guestbook',
  CV: 'CV',
  MOVIES: 'Movies',
  NOT_FOUND: '404'
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
    component: () => import('./../../pages/About.md')
  },
  {
    path: '/g',
    name: routeNames.GUESTBOOK,
    component: () => import('./../components/pages/Guestbook.vue')
  },
  {
    path: '*',
    name: routeNames.NOT_FOUND,
    component: () => import('./../components/pages/NotFound.vue')
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
    case routeNames.HOME:
      buildTitle(store.state.baseTitle)
      break
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
    case routeNames.CATEGORY:
      buildTitle(store.state.baseTitle, `Category ${path.replace('/c/', '')}`)
      break
    case routeNames.TAG:
      buildTitle(store.state.baseTitle, `Tag ${path.replace('/t/', '')}`)
      break
    default:
      buildTitle(store.state.baseTitle, to.name)
  }
})

export default router
