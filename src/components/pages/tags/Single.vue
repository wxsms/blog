<template>
  <section>
    <h1>Tag {{tag}}</h1>
    <ul class="archives-list">
      <li v-for="post in tagPosts">
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
            if (post.tags.indexOf(this.tag) >= 0) {
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
