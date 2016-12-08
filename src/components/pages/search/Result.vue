<template>
  <section>
    <page-header :title="'Search: '+query" back-to="/q"></page-header>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <div v-if="queryPosts.length">
            <ul class="archives-list">
              <li v-for="post in queryPosts">
                <list-item :post="post"></list-item>
              </li>
            </ul>
          </div>
          <div v-else>
            <p>(No result)</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from '../../architecture/PageHeader.vue'
  import ListItem from '../archive/ArchiveListItem.vue'

  export default {
    components: { PageHeader, ListItem },
    data () {
      return {
        query: this.$route.params.q
      }
    },
    computed: {
      postList () {
        return this.$store.state.postList
      },
      queryPosts () {
        let posts = []
        let q = this.query.toLowerCase()
        this.postList.forEach(post => {
          try {
            let title = post.meta.title.toLowerCase()
            let id = post.meta.id.toString().toLowerCase()
            if (title.indexOf(q) >= 0 || id.indexOf(q) >= 0) {
              posts.push(post)
            }
          } catch (e) {
            // ignore
          }
        })
        return posts
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
