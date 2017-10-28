<template>
  <section>
    <post-excerpt v-for="post in postsWithExcerpt" :key="post.id" :post="post"></post-excerpt>
    <div>
      <router-link to="/p" class="btn btn-default">PREVIOUSLY ON SPACE</router-link>
    </div>
  </section>
</template>

<script>
  import PostExcerpt from './archive/PostExcerpt.vue'

  export default {
    components: {PostExcerpt},
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
