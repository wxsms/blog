import Vue from 'vue'
import Vuex from 'vuex'
import posts from './../../dist/posts/index.json'
import actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

const state = {
  baseTitle: 'wxsm\'s space',
  posts: {},
  postList: posts,
  asideShow: false,
  asideToc: null
}

export default new Vuex.Store({
  state,
  mutations,
  actions
})
