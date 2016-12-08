<template>
  <section>
    <page-header title="Archive"></page-header>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <ul class="nav nav-tabs">
            <li v-for="(r,index) in limit(reduce,maxTabNum)" :class="{'active':index===activeIndex}" @click="activeIndex=index">
              <a href="javascript:void(0)">{{r.year}}</a>
            </li>
            <li :class="{'active':activeIndex===-1}">
              <a href="javascript:void(0)" @click="activeIndex=-1">OLDER</a>
            </li>
          </ul>
          <div class="tab-content">
            <transition-group name="tab">
              <div class="tab-pane active" v-show="index===activeIndex" :key="index" v-for="(r,index) in limit(reduce,maxTabNum)">
                <ul class="archives-list">
                  <li v-for="post in r.posts">
                    <list-item :post="post"></list-item>
                  </li>
                </ul>
              </div>
              <div class="tab-pane active" v-show="-1===activeIndex" :key="-1">
                <ul class="archives-list">
                  <template v-for="r in from(reduce,maxTabNum)">
                    <li>
                      <b>{{r.year}}</b>
                    </li>
                    <li v-for="post in r.posts">
                      <list-item :post="post"></list-item>
                    </li>
                  </template>
                </ul>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../../architecture/PageHeader.vue'
  import Loading from './../../common/Loading.vue'
  import ListItem from './ArchiveListItem.vue'

  export default {
    components: { PageHeader, Loading, ListItem },
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
        activeIndex: 0,
        maxTabNum: 4
      }
    },
    methods: {
      limit: (arr, limit) => arr.slice(0, limit),
      from: (arr, from) => arr.slice(from)
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../../assets/css/variables";

  .tab-pane {
    transition: opacity .3s ease-in-out;
    opacity: 1;
  }

  .tab-enter {
    opacity: 0;
  }

  .tab-leave {
    display: none;
  }

  .tab-leave-active {
    transition: none;
  }
</style>
