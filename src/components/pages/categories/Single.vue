<template>
  <section>
    <h1>Category {{category}}</h1>
    <ul class="archives-list">
      <li v-for="post in categoryPosts">
        <list-item :post="post"></list-item>
      </li>
    </ul>
  </section>
</template>

<script>
  import ListItem from './../archive/ArchiveListItem.vue'

  export default {
    components: {ListItem},
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
            if (post.categories.indexOf(this.category) >= 0) {
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
