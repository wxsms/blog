import VueRouter from 'vue-router'

const routes = [
  {path: '/', component: require('./../components/pages/Home.vue')},
  {path: '/p', component: require('./../components/pages/archive/Archive.vue')},
  {path: '/p/:p', component: require('./../components/pages/archive/Single.vue')},
  {path: '/t', component: require('./../components/pages/tags/Tags.vue')},
  {path: '/t/:t', component: require('./../components/pages/tags/Single.vue')},
  {path: '/c', component: require('./../components/pages/categories/Categories.vue')},
  {path: '/c/:c', component: require('./../components/pages/categories/Single.vue')},
  {path: '/q', component: require('./../components/pages/search/Search.vue')},
  {path: '/q/:q', component: require('./../components/pages/search/Result.vue')},
  {path: '/a', component: require('./../components/pages/About.vue')},
  {path: '/g', component: require('./../components/pages/Guestbook.vue')},
  {path: '/o/cv', component: resolve => require(['./../components/pages/Cv.vue'], resolve)},
  {path: '*', component: require('./../components/pages/NotFound.vue')}
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

export default router
