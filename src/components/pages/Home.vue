<template>
  <section>
    <post-excerpt v-for="post in postsWithExcerpt" :key="post.id" :post="post"></post-excerpt>
    <div>
      <btn to="/p">ARCHIVE...</btn>
    </div>
  </section>
</template>

<script>
  import {Btn} from 'uiv'
  import PostExcerpt from './archive/PostExcerpt.vue'

  export default {
    components: {PostExcerpt, Btn},
    computed: {
      postsWithExcerpt () {
        return this.$store.state.postList.filter(v => {
          return !!v.excerpt
        })
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
