'use strict'

import Vue from 'vue'
import Vuex from 'vuex'
import posts from './../../dist/posts/index.json'
import actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

const state = {
  posts: {},
  postList: posts,
  asideShow: false,
  asideItems: [{
    path: '/p',
    label: 'Archive'
  }, {
    path: '/c',
    label: 'Categories'
  }, {
    path: '/t',
    label: 'Tags'
  }, {
    path: '/g',
    label: 'Guestbook'
  }, {
    path: '/a',
    label: 'About'
  }],
  asideShowToc: false,
  asideToc: []
}

export default new Vuex.Store({
  state,
  mutations,
  actions
})
