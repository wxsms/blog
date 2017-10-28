import './assets/css/vender.less'
import './assets/css/common.less'

import 'es6-promise/auto'
import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'
import PageWrapper from './components/architecture/PageWrapper.vue'
import store from './store/store'
import router from './router/index'
import * as uiv from 'uiv'

Vue.http = Vue.prototype.$http = axios
Vue.use(VueRouter)
Vue.use(uiv)

document.addEventListener('DOMContentLoaded', () => {
  new Vue({
    store,
    router,
    template: '<PageWrapper/>',
    components: {PageWrapper}
  }).$mount('#app')
})
