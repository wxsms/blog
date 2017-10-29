import VueRouter from 'vue-router'
import NProgress from 'nprogress'
import * as routes from './routes'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 250,
  minimum: 0.15
})

const router = new VueRouter({
  routes: routes.routes,
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
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
    case routes.ROUTE_NAMES.HOME:
      buildTitle(store.state.baseTitle)
      break
    case routes.ROUTE_NAMES.POST:
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
    case routes.ROUTE_NAMES.CATEGORY:
      buildTitle(store.state.baseTitle, `Category ${path.replace('/c/', '')}`)
      break
    case routes.ROUTE_NAMES.TAG:
      buildTitle(store.state.baseTitle, `Tag ${path.replace('/t/', '')}`)
      break
    default:
      buildTitle(store.state.baseTitle, to.name)
  }
})

export default router
