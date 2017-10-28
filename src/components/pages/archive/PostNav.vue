<template>
  <nav>
    <ul class="pager">
      <li class="previous">
        <router-link v-if="prev" :to="'/p/' + prev.id" v-tooltip="prev.title">
          <span aria-hidden="true">&larr;</span> Prev
        </router-link>
      </li>
      <li class="next">
        <router-link v-if="next" :to="'/p/' + next.id" v-tooltip="next.title">
          Next  <span aria-hidden="true">&rarr;</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
  export default {
    props: {
      post: {
        type: Object,
        required: true
      }
    },
    computed: {
      postList () {
        return this.$store.state.postList
      },
      prev () {
        for (let i = 0, l = this.postList.length; i < l; i++) {
          if (this.postList[i].id === this.post.id) {
            return i < l - 1 ? this.postList[i + 1] : null
          }
        }
      },
      next () {
        if (this.post) {
          for (let i = 0, l = this.postList.length; i < l; i++) {
            if (this.postList[i].id === this.post.id) {
              return i > 0 ? this.postList[i - 1] : null
            }
          }
        }
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
