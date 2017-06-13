<template>
  <section>
    <page-header :title="'标签：'+tag" back-to="/t"></page-header>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <div>
            <ul class="archives-list">
              <li v-for="post in tagPosts">
                <list-item :post="post"></list-item>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../../architecture/PageHeader.vue'
  import ListItem from './../archive/ArchiveListItem.vue'

  export default {
    components: { PageHeader, ListItem },
    data () {
      return {
        tag: this.$route.params.t
      }
    },
    computed: {
      postList () {
        return this.$store.state.postList
      },
      tagPosts () {
        let posts = []
        this.postList.forEach(post => {
          try {
            if (post.meta.tags.indexOf(this.tag) >= 0) {
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
