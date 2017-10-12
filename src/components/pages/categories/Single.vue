<template>
  <section>
    <page-header :title="'Category '+category" back-to="/c"></page-header>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <div>
            <ul class="archives-list">
              <li v-for="post in categoryPosts">
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
        category: this.$route.params.c
      }
    },
    computed: {
      postList () {
        return this.$store.state.postList
      },
      categoryPosts () {
        let posts = []
        this.postList.forEach(post => {
          try {
            if (post.meta.categories.indexOf(this.category) >= 0) {
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
