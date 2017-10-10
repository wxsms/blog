<template>
  <section>
    <page-header :title="headerText"></page-header>
    <div class="container-fluid" v-if="post">
      <div class="row" id="post-content">
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
          <h4>
            <i class="glyphicon glyphicon-exclamation-sign"></i>
            <span>没有找到该文章。</span>
          </h4>
          <br/>
          <p>可能的原因：</p>
          <ul>
            <li>文章不存在，或已被删除；</li>
            <li>网络连接故障。</li>
          </ul>
          <p>尝试搜索？</p>
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
  import SearchForm from './../../common/SearchForm.vue'
  import store from './../../../store/store'
  import { getAnchors } from './../../../util/DomUtils'

  const fetchPost = (to, from, next) => {
    let postList = store.state.posts
    let postId = to.params.p
    if (postList.hasOwnProperty(postId)) {
      next()
    } else {
      store.dispatch(types.GET_POST_BY_ID, postId)
        .then(() => {
          next()
        })
        .catch(err => {
          console.error(err)
          next()
        })
    }
  }

  export default {
    components: {PageHeader, Disqus, PostMeta, PostNav, SearchForm},
    data () {
      return {
        id: this.$route.params.p,
        post: null
      }
    },
    mounted () {
      let postList = this.$store.state.posts
      if (postList.hasOwnProperty(this.id)) {
        this.post = postList[this.id]
        if (this.post.meta && this.post.meta.index) {
          this.$nextTick(() => {
            let anchors = getAnchors()
            this.$store.commit(types.ASIDE_TOGGLE_TOC, true)
            this.$store.commit(types.ASIDE_SET_TOC, anchors)
          })
        } else {
          this.$store.commit(types.ASIDE_TOGGLE_TOC, false)
          this.$store.commit(types.ASIDE_SET_TOC, [])
        }
      }
    },
    beforeRouteEnter (to, from, next) {
      fetchPost(to, from, next)
    },
    beforeRouteUpdate (to, from, next) {
      fetchPost(to, from, next)
    },
    beforeDestroy () {
      this.$store.commit(types.ASIDE_TOGGLE_TOC, false)
      this.$store.commit(types.ASIDE_SET_TOC, [])
    },
    methods: {},
    computed: {
      headerText () {
        return this.post && this.post.meta ? this.post.meta.title : 'Not Found'
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
