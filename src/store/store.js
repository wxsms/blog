'use strict'

import Vue from 'vue'
import Vuex from 'vuex'
import posts from './../../dist/posts/index.json'
import actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

// path: '/m',
// label: '电影'

const state = {
  baseTitle: 'wxsm\'s space',
  posts: {},
  postList: posts,
  asideShow: false,
  asideItems: [{
    path: '/p',
    label: '归档'
  }, {
    path: '/m',
    label: '电影'
  }, {
    path: '/c',
    label: '目录'
  }, {
    path: '/t',
    label: '标签'
  }, {
    path: '/g',
    label: '留言'
  }, {
    path: '/a',
    label: '关于'
  }],
  asideShowToc: false,
  asideToc: []
}

export default new Vuex.Store({
  state,
  mutations,
  actions
})
