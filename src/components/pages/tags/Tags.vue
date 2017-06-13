<template>
  <section>
    <page-header title="标签"></page-header>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <div>
            <tag v-for="tag in tags" :tag="tag"></tag>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../../architecture/PageHeader.vue'
  import Tag from './../../common/Tag.vue'

  export default {
    components: { PageHeader, Tag },
    computed: {
      postList () {
        return this.$store.state.postList
      },
      tags () {
        let tags = []
        this.postList.forEach(post => {
          try {
            post.meta.tags.forEach(tag => {
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
