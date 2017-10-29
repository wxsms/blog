const ROUTE_NAMES = {
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
    name: ROUTE_NAMES.HOME,
    component: () => import('./../components/pages/Home.vue')
  },
  {
    path: '/p',
    name: ROUTE_NAMES.ARCHIVE,
    meta: {nav: true},
    component: () => import('./../components/pages/archive/Archive.vue')
  },
  {
    path: '/p/:p',
    name: ROUTE_NAMES.POST,
    component: () => import('./../components/pages/archive/Single.vue')
  },
  {
    path: '/c',
    name: ROUTE_NAMES.CATEGORIES,
    meta: {nav: true},
    component: () => import('./../components/pages/categories/Categories.vue')
  },
  {
    path: '/c/:c',
    name: ROUTE_NAMES.CATEGORY,
    component: () => import('./../components/pages/categories/Single.vue')
  },
  {
    path: '/t',
    name: ROUTE_NAMES.TAGS,
    meta: {nav: true},
    component: () => import('./../components/pages/tags/Tags.vue')
  },
  {
    path: '/t/:t',
    name: ROUTE_NAMES.TAG,
    component: () => import('./../components/pages/tags/Single.vue')
  },
  {
    path: '/q',
    name: ROUTE_NAMES.QUERY,
    component: () => import('./../components/pages/search/Search.vue')
  },
  {
    path: '/q/:q',
    name: ROUTE_NAMES.QUERY_RESULT,
    component: () => import('./../components/pages/search/Result.vue')
  },
  {
    path: '/g',
    name: ROUTE_NAMES.GUESTBOOK,
    meta: {nav: true},
    component: () => import('./../components/pages/Guestbook.vue')
  },
  {
    path: '/a',
    name: ROUTE_NAMES.ABOUT,
    meta: {nav: true},
    component: () => import('./../../pages/About.md')
  },
  {
    path: '*',
    name: ROUTE_NAMES.NOT_FOUND,
    component: () => import('./../components/pages/NotFound.vue')
  }
]

export {ROUTE_NAMES, routes}
