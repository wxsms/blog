<template>
  <section class="post-box">
    <h1>
      <router-link :to="'/p/' + post.id">{{post.title}}</router-link>
    </h1>
    <div class="post-excerpt" v-html="post.excerpt"></div>
    <post-meta :post="post"></post-meta>
    <p>
      <router-link :to="'/p/'+post.id" class="btn btn-primary">
        <span>Read More</span>
        <i class="glyphicon glyphicon-chevron-right"></i>
      </router-link>
    </p>
  </section>
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
