<template>
  <section>
    <h1>Archive</h1>
    <tabs>
      <tab v-for="(r,index) in reduce" :key="index" :title="r.year.toString()" :group="index>=maxTabNum?'OLDER':''">
        <ul class="archives-list">
          <li v-for="post in r.posts">
            <list-item :post="post"></list-item>
          </li>
        </ul>
      </tab>
    </tabs>
  </section>
</template>

<script>
  import Loading from './../../common/Loading.vue'
  import ListItem from './ArchiveListItem.vue'

  export default {
    components: {Loading, ListItem},
    computed: {
      postList () {
        return this.$store.state.postList
      },
      reduce () {
        let years = []
        this.postList.forEach(v => {
          let date = new Date(v.date)
          let year = date.getFullYear()
          if (years.indexOf(year) < 0) {
            years.push(year)
          }
        })
        return years.sort((a, b) => b - a).map(year => {
          let posts = this.postList.map(v => {
            let date = new Date(v.date)
            v._year = date.getFullYear()
            return v
          })
          posts = posts.filter(v => v._year === year)
          return {
            year: year,
            posts: posts
          }
        })
      }
    },
    data () {
      return {
        maxTabNum: 4
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../../assets/css/variables";

</style>
