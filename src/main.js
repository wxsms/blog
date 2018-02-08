import './assets/css/vender.less'

import 'es6-promise/auto'
import Vue from 'vue'
import * as uiv from 'uiv'
import VueRouter from 'vue-router'
import VueAnalytics from 'vue-analytics'
import axios from 'axios'
import PageWrapper from './components/architecture/PageWrapper.vue'
import store from './store/store'
import router from './router/index'

Vue.http = Vue.prototype.$http = axios
Vue.use(VueRouter)
Vue.use(uiv)

// apply google analytics only on production mode
if (process.env && process.env.NODE_ENV === 'production') {
  Vue.use(VueAnalytics, {
    id: 'UA-102731925-1',
    router,
    autoTracking: {
      skipSamePath: true
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  new Vue({
    store,
    router,
    template: '<PageWrapper/>',
    components: {PageWrapper}
  }).$mount('#app')
})
