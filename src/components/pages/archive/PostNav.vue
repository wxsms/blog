<template>
  <nav>
    <ul class="pager">
      <li class="previous">
        <router-link v-if="prev" :to="'/p/' + prev.id">
          <i class="glyphicon glyphicon-chevron-left"></i> {{prev.title}}
        </router-link>
      </li>
      <li class="next">
        <router-link v-if="next" :to="'/p/' + next.id">
          {{next.title}} <i class="glyphicon glyphicon-chevron-right"></i>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
  import {findIndex} from 'lodash'

  export default {
    props: {
      post: {
        type: Object,
        required: true
      }
    },
    computed: {
      list () {
        return this.$store.state.postList
      },
      prev () {
        let index = findIndex(this.list, post => post.id === this.post.id) + 1
        return index < this.list.length ? this.list[index] : null
      },
      next () {
        if (this.post) {
          let index = findIndex(this.list, post => post.id === this.post.id) - 1
          return index >= 0 ? this.list[index] : null
        }
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
