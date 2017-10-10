import './assets/bootstrap/css/paper.css'
import 'highlight.js/styles/github-gist.css'
import 'nprogress/nprogress.css'
import './assets/css/common.less'

import 'es6-promise/auto'
import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'
import PageWrapper from './components/architecture/PageWrapper.vue'

import store from './store/store'
import router from './router/index'

Vue.http = Vue.prototype.$http = axios
Vue.component('PageWrapper', PageWrapper)
Vue.use(VueRouter)

document.addEventListener('DOMContentLoaded', () => {
  new Vue({
    store,
    router,
    template: '<PageWrapper/>',
    components: {PageWrapper}
  }).$mount('#app')
})
