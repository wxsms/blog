<template>
  <section>
    <page-header :title="headerText"></page-header>
    <div class="container-fluid" v-if="validId">
      <div class="row" v-if="post">
        <div class="col-xs-12">
          <div class="post-container" v-html="post.html" ref="post"></div>
          <post-meta :post="post"></post-meta>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12">
          <post-nav :post="post"></post-nav>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12">
          <disqus></disqus>
        </div>
      </div>
    </div>
    <div class="container-fluid" v-else>
      <div class="row">
        <div class="col-xs-12">
          <h5>
            <i class="glyphicon glyphicon-exclamation-sign"></i>
            This post is never or no longer exist.
          </h5>
          <br/>
          <search-form></search-form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import types from '../../../store/mutationTypes'
  import PageHeader from './../../architecture/PageHeader.vue'
  import Disqus from './../../common/Disqus.vue'
  import PostMeta from './PostMeta.vue'
  import PostNav from './PostNav.vue'
  import Loading from './../../common/Loading.vue'
  import SearchForm from './../../common/SearchForm.vue'

  export default {
    components: { PageHeader, Disqus, PostMeta, PostNav, Loading, SearchForm },
    mounted () {
      if (!this.posts.hasOwnProperty(this.id) && this.validId) {
        this.initPostById(this.id)
      }
    },
    methods: {
      initPostById (id) {
        this.$store.dispatch(types.GET_POST_BY_ID, id)
      }
    },
    computed: {
      headerText () {
        if (!this.validId) {
          return 'Error'
        } else {
          return this.post && this.post.meta ? this.post.meta.title : 'Loading...'
        }
      },
      posts () {
        return this.$store.state.posts
      },
      post () {
        if (this.posts.hasOwnProperty(this.id)) {
          return this.posts[this.id]
        } else {
          return undefined
        }
      },
      validId () {
        let list = this.$store.state.postList
        for (let i = 0, l = list.length; i < l; i++) {
          if (list[i].meta && list[i].meta.id === this.id) {
            return true
          }
        }
        return false
      }
    },
    data () {
      return {
        id: this.$route.params.p
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
