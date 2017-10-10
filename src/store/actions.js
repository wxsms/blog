import types from './mutationTypes'
import Vue from 'vue'

export default {
  [types.GET_POST_BY_ID] ({commit}, id) {
    return Vue.http.get(`/posts/${id}.json?_t=${new Date().getTime()}`)
      .then(res => {
        let data = res.data
        commit(types.GET_POST_SINGLE_SUCCESS, data)
        return Promise.resolve(data)
      })
      .catch(err => {
        commit(types.GET_POST_SINGLE_ERROR)
        return Promise.reject(err)
      })
  }
}
