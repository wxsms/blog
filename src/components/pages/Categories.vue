<template>
  <section>
    <h1>Categories</h1>
    <template v-for="group in postsGroupedByCategory">
      <div class="category" :id="group.name">
        <a role="button" href="javascript:void(0)" @click="toggleGroup(group)">
          <span>{{group.name}}</span>
          <small class="text-muted">({{group.posts.length}})</small>
        </a>
      </div>
      <collapse v-model="group.show">
        <div class="well">
          <list-item v-for="post in group.posts" :post="post" :key="post.id"/>
        </div>
        <br/>
      </collapse>
    </template>
  </section>
</template>

<script>
  import {uniq, flatten} from 'lodash'
  import ListItem from './archive/ArchiveListItem.vue'

  export default {
    components: {ListItem},
    data () {
      return {
        postsGroupedByCategory: []
      }
    },
    mounted () {
      let list = this.$store.state.postList
      let name = this.$route.hash && this.$route.hash.slice(1)
      this.postsGroupedByCategory = uniq(flatten(list.map(post => post.categories)))
        .map(category => {
          return {
            name: category,
            show: name === category,
            posts: list.filter(post => post.categories.indexOf(category) >= 0)
          }
        })
    },
    methods: {
      toggleGroup (group) {
        this.$set(group, 'show', !group.show)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "../../assets/css/variables";

  .category {
    padding: 5px 0;

    a {
      color: inherit !important;
      text-decoration: none !important;
    }
  }

  .well {
    margin-bottom: 0;
  }
</style>
