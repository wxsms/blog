'use strict'

import types from './mutationTypes'
import Vue from 'vue'

export default {
  [types.TOGGLE_ASIDE] (state, show) {
    if (typeof show !== 'undefined') {
      state.asideShow = !!show
    } else {
      state.asideShow = !state.asideShow
    }
  },
  [types.GET_POST_SINGLE_SUCCESS] (state, post) {
    Vue.set(state.posts, post.meta.id, post)
  },
  [types.GET_POST_SINGLE_ERROR] (state) {
    // TODO
  },
  [types.ASIDE_SET_TOC] (state, toc) {
    state.asideToc = toc
  }
}
