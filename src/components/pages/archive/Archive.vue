<template>
  <section>
    <page-header title="Archive"></page-header>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <tabs>
            <tab v-for="(r,index) in reduce" :key="index" :title="r.year.toString()" :group="index>=maxTabNum?'OLDER':''">
              <ul class="archives-list">
                <li v-for="post in r.posts">
                  <list-item :post="post"></list-item>
                </li>
              </ul>
            </tab>
          </tabs>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../../architecture/PageHeader.vue'
  import Loading from './../../common/Loading.vue'
  import ListItem from './ArchiveListItem.vue'
  import {Tabs, Tab} from 'uiv'

  export default {
    components: {PageHeader, Loading, ListItem, Tabs, Tab},
    computed: {
      postList () {
        return this.$store.state.postList
      },
      reduce () {
        let years = []
        this.postList.forEach(v => {
          let date = new Date(v.meta.date)
          let year = date.getFullYear()
          if (years.indexOf(year) < 0) {
            years.push(year)
          }
        })
        return years.sort((a, b) => b - a).map(year => {
          let posts = this.postList.map(v => {
            let date = new Date(v.meta.date)
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
