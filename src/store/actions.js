'use strict'
import types from './mutationTypes'
import Vue from 'vue'

export default {
  [types.GET_POST_BY_ID] ({ commit }, id) {
    Vue.http.get(`/posts/${id}.json?_t=${new Date().getTime()}`).then(res => {
      commit(types.GET_POST_SINGLE_SUCCESS, res.data)
    }, err => {
      console.error(err)
      commit(types.GET_POST_SINGLE_ERROR)
    })
  }
}
