<template>
  <section>
    <h1>{{headerText}}</h1>
    <section v-if="post" id="post-content">
      <div v-html="post.html" ref="post"></div>
      <post-meta :post="post"></post-meta>
      <post-nav :post="post"></post-nav>
      <disqus></disqus>
    </section>
    <section v-else>
      <h4>
        <i class="glyphicon glyphicon-exclamation-sign"></i>
        <span>Post not found.</span>
      </h4>
      <br/>
      <p>Possible reasons:</p>
      <ul>
        <li>Post deleted or never exist.</li>
        <li>Network connection issue.</li>
      </ul>
      <p>Try search?</p>
      <search-form></search-form>
    </section>
  </section>
</template>

<script>
  import types from '../../../store/mutationTypes'
  import Disqus from './../../common/Disqus.vue'
  import PostMeta from './PostMeta.vue'
  import PostNav from './PostNav.vue'
  import SearchForm from './../../common/SearchForm.vue'
  import store from './../../../store/store'

  export function getAnchors (el) {
    if (!el) {
      return
    }
    let anchors = []
    // let headings = document.querySelectorAll(`h1${attr},h2${attr},h3${attr},h4${attr},h5${attr},h6${attr}`)
    let headings = document.querySelectorAll(`h2[id],h3[id]`)
    for (let i = 0; i < headings.length; i++) {
      let h = headings[i]
      let t = {
        level: parseInt(h.tagName.substr(1, 1)),
        href: '#' + h.id,
        label: h.innerText.replace('🔗', ''),
        items: []
      }
      if (t.level === 2) {
        anchors.push(t)
      } else if (anchors.length) {
        anchors[anchors.length - 1].items.push(t)
      }
    }
    return anchors
  }

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
    components: {Disqus, PostMeta, PostNav, SearchForm},
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
        if (this.post.index) {
          this.$nextTick(() => {
            let anchors = getAnchors(this.$refs.post)
            this.$store.commit(types.ASIDE_SET_TOC, anchors)
          })
        } else {
          this.$store.commit(types.ASIDE_SET_TOC, null)
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
      this.$store.commit(types.ASIDE_SET_TOC, null)
    },
    computed: {
      headerText () {
        return this.post ? this.post.title : 'Not Found'
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
