<template>
  <section>
    <h1>Search '{{query}}'</h1>
    <p class="text-muted">
      <span v-if="queryPosts.length">
        <i class="glyphicon glyphicon-check"></i> <b>{{queryPosts.length}}</b> matched found.
      </span>
      <span v-else>
        <i class="glyphicon glyphicon-info-sign"></i> No result.
      </span>
    </p>
    <ul class="archives-list">
      <li v-for="post in queryPosts">
        <list-item :post="post" :show-year="true"></list-item>
      </li>
    </ul>
  </section>
</template>

<script>
  import ListItem from './archive/ArchiveListItem.vue'
  import Fuse from 'fuse.js'

  export default {
    components: {ListItem},
    props: {
      query: {
        type: String
      }
    },
    data () {
      return {
        fuse: null
      }
    },
    computed: {
      queryPosts () {
        return this.fuse && this.query ? this.fuse.search(this.query) : []
      }
    },
    mounted () {
      let list = this.$store.state.postList.slice()
      this.fuse = new Fuse(list, {
        // Whether to sort the result list, by score.
        shouldSort: true,
        // At what point does the match algorithm give up.
        // A threshold of 0.0 requires a perfect match (of both letters and location).
        // A threshold of 1.0 would match anything.
        threshold: 0.4,
        // Determines approximately where in the text is the pattern expected to be found.
        location: 0,
        // Determines how close the match must be to the fuzzy location (specified by location).
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['id', 'title']
      })
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
