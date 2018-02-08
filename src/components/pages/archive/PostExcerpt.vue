<template>
  <section class="post-box">
    <h1>
      <router-link :to="to">{{post.title}}</router-link>
    </h1>
    <post-meta :post="post"/>
    <div class="post-excerpt" v-html="post.excerpt"></div>
    <btn :to="to" v-if="!post.full" type="primary" size="sm">Read more &raquo;</btn>
  </section>
</template>

<script>
  import PostMeta from './PostMeta.vue'

  export default {
    components: {PostMeta},
    props: {
      post: {
        type: Object,
        required: true
      }
    },
    computed: {
      to () {
        return `/p/${this.post.id}`
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .post-box {
    margin: 0 0 50px;
  }
</style>
