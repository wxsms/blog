import Vue from 'vue'
import Vuex from 'vuex'
import posts from './../../dist/posts/index.json'
import actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

const cleanPosts = () => {
  return posts
    .map(post => {
      post.date = new Date(post.date)
      post.tags = Array.isArray(post.tags) ? post.tags : []
      post.categories = Array.isArray(post.categories) ? post.categories : []
      post.id = post.id.toString()
      post.title = post.title.toString()
      return post
    })
    .sort((a, b) => b.date - a.date)
}

const state = {
  baseTitle: 'wxsm\'s space',
  posts: {},
  postList: cleanPosts(),
  asideShow: false,
  asideToc: null
}

export default new Vuex.Store({
  state,
  mutations,
  actions
})
