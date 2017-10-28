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

  export default {
    components: {Tag},
    computed: {
      postList () {
        return this.$store.state.postList
      },
      tags () {
        let tags = []
        this.postList.forEach(post => {
          try {
            post.tags.forEach(tag => {
              if (tags.indexOf(tag) < 0) {
                tags.push(tag)
              }
            })
          } catch (e) {
            // ignore
          }
        })
        // return tags.sort()
        return tags
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../../assets/css/variables";


</style>
