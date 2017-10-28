<template>
  <section>
    <h1>Search {{query}}</h1>
    <div v-if="queryPosts.length">
      <ul class="archives-list">
        <li v-for="post in queryPosts">
          <list-item :post="post" :show-year="true"></list-item>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>(No result)</p>
    </div>
  </section>
</template>

<script>
  import ListItem from '../archive/ArchiveListItem.vue'
  import Fuse from 'fuse.js'

  export default {
    components: {ListItem},
    data () {
      return {
        query: this.$route.params.q,
        queryPosts: []
      }
    },
    mounted () {
      let fuse = new Fuse(this.$store.state.postList, {
        // Whether to sort the result list, by score.
        shouldSort: true,
        // At what point does the match algorithm give up.
        // A threshold of 0.0 requires a perfect match (of both letters and location).
        // A threshold of 1.0 would match anything.
        threshold: 0.5,
        // Determines approximately where in the text is the pattern expected to be found.
        location: 0,
        // Determines how close the match must be to the fuzzy location (specified by location).
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          'id',
          'title'
        ]
      })
      this.queryPosts = fuse.search(this.query)
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
