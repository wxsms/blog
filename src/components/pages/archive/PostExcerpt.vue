<template>
  <div class="post-box">
    <h2 class="page-header">
      <router-link :to="'/p/'+post.meta.id">{{post.meta.title}}</router-link>
    </h2>
    <div class="post-excerpt" v-html="post.meta.excerpt"></div>
    <post-meta :post="post"></post-meta>
    <p>
      <router-link :to="'/p/'+post.meta.id" class="btn btn-primary">
        <span>继续阅读</span>
        <i class="glyphicon glyphicon-chevron-right"></i>
      </router-link>
    </p>
  </div>
</template>

<script>
  import PostMeta from './PostMeta.vue'

  export default {
    components: {PostMeta},
    props: ['post']
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .post-box {
    margin: 0 0 50px;
  }
</style>
