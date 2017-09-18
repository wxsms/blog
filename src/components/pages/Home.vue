<template>
  <section>
    <div class="visible-xs">
      <page-header title="wxsm's space"></page-header>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <post-excerpt v-for="post in postsWithExcerpt" :post="post"></post-excerpt>
          <br/>
          <div>
            <router-link to="/p"><i class="glyphicon glyphicon-chevron-left"></i> 更早的文章</router-link>
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
