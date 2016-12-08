<template>
  <section>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <post-excerpt v-for="post in postsWithExcerpt" :post="post"></post-excerpt>
          <br/>
          <div>
            <router-link class="btn btn-default" to="/p">Visit Archive for Older Posts</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PostExcerpt from './archive/PostExcerpt.vue'

  export default {
    components: { PostExcerpt },
    computed: {
      postsWithExcerpt () {
        return this.postList.filter(v => {
          return !!v.meta.excerpt
        })
      },
      postList () {
        return this.$store.state.postList
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
