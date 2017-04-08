import './assets/bootstrap/css/paper.css'
import 'highlight.js/styles/github-gist.css'
import 'uiv/dist/uiv.min.css'
import './assets/css/common.less'

import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import PageWrapper from './components/architecture/PageWrapper.vue'

import store from './store/store'
import router from './router/index'

Vue.component('PageWrapper', PageWrapper)
Vue.use(VueRouter)
Vue.use(VueResource)

new Vue({
  store,
  router,
  template: '<PageWrapper/>',
  components: { PageWrapper }
}).$mount('#app')
