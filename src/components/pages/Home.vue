<template>
  <section>
    <div class="visible-xs">
      <page-header title="wxsm's space"></page-header>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <post-excerpt v-for="post in postsWithExcerpt" :post="post"></post-excerpt>
          <div>
            <router-link to="/p" class="btn btn-default">Older Posts</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PostExcerpt from './archive/PostExcerpt.vue'
  import PageHeader from './../architecture/PageHeader.vue'

  export default {
    components: {PostExcerpt, PageHeader},
    computed: {
      postsWithExcerpt () {
        return this.$store.state.postList.filter(v => {
          return !!v.meta.excerpt
        })
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
