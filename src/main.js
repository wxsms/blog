import './assets/bootstrap/css/paper.css'
import 'highlight.js/styles/github-gist.css'
import './assets/css/common.less'

import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'

import store from './store/store'
import NotFound from './components/pages/NotFound.vue'
import PageWrapper from './components/architecture/PageWrapper.vue'
import Homepage from './components/pages/Home.vue'
import Archive from './components/pages/archive/Archive.vue'
import Tags from './components/pages/tags/Tags.vue'
import Tag from './components/pages/tags/Single.vue'
import Categories from './components/pages/categories/Categories.vue'
import Category from './components/pages/categories/Single.vue'
import Single from './components/pages/archive/Single.vue'
import About from './components/pages/About.vue'
import Guestbook from './components/pages/Guestbook.vue'
import Search from './components/pages/search/Search.vue'
import Result from './components/pages/search/Result.vue'
const Cv = resolve => require(['./components/pages/Cv.vue'], resolve)

Vue.component('PageWrapper', PageWrapper)

Vue.use(VueRouter)
Vue.use(VueResource)

let routes = [
  { path: '/', component: Homepage },
  { path: '/p', component: Archive },
  { path: '/p/:p', component: Single },
  { path: '/t', component: Tags },
  { path: '/t/:t', component: Tag },
  { path: '/c', component: Categories },
  { path: '/c/:c', component: Category },
  { path: '/q', component: Search },
  { path: '/q/:q', component: Result },
  { path: '/a', component: About },
  { path: '/g', component: Guestbook },
  { path: '/o/cv', component: Cv },
  { path: '*', component: NotFound }
]

let router = new VueRouter({
  routes,
  mode: 'history'
})

new Vue({
  store,
  router,
  template: '<PageWrapper/>',
  components: { PageWrapper }
}).$mount('#app')
