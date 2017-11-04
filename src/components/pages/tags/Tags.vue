<template>
  <section>
    <h1>Tags</h1>
    <div>
      <tag v-for="tag in tags" :tag="tag" :key="tag"></tag>
    </div>
  </section>
</template>

<script>
  import Tag from './../../common/Tag.vue'
  import {uniq, flatten} from 'lodash'

  export default {
    components: {Tag},
    data () {
      return {
        postsGroupedByTag: [],
        tags: []
      }
    },
    mounted () {
      let list = this.$store.state.postList
      let name = this.$route.hash && this.$route.hash.slice(1)
      this.tags = uniq(flatten(list.map(post => post.tags)))
      this.postsGroupedByTag = this.tags.map(tag => {
        return {
          name: tag,
          show: name === tag,
          posts: list.filter(post => post.categories.indexOf(tag) >= 0)
        }
      })
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../../assets/css/variables";


</style>
