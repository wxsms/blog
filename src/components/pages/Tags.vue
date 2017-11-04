<template>
  <section>
    <h1>Tags</h1>
    <div>
      <tag
        v-for="group in postsGroupedByTag"
        :tag="group.name"
        :key="group.name"
        :muted="selectedTag && selectedTag !== group.name"
        @click.native="selectTag(group.name)"/>
    </div>
    <br/>
    <div v-for="group in postsGroupedByTag" v-show="selectedTag && selectedTag === group.name">
      <div class="well well-arrow">
        <list-item v-for="post in group.posts" :post="post" :key="post.id"/>
      </div>
    </div>
  </section>
</template>

<script>
  import Tag from '../common/Tag.vue'
  import {uniq, flatten} from 'lodash'
  import ListItem from './archive/ArchiveListItem.vue'

  export default {
    components: {Tag, ListItem},
    data () {
      return {
        postsGroupedByTag: [],
        selectedTag: null
      }
    },
    mounted () {
      let list = this.$store.state.postList
      let name = this.$route.hash && this.$route.hash.slice(1)
      this.postsGroupedByTag = uniq(flatten(list.map(post => post.tags))).map(tag => {
        return {
          name: tag,
          posts: list.filter(post => post.tags.indexOf(tag) >= 0)
        }
      })
      if (name) {
        this.selectedTag = name
      }
    },
    methods: {
      selectTag (tag) {
        this.selectedTag = this.selectedTag === tag ? null : tag
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "../../assets/css/variables";


</style>
