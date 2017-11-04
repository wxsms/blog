<template>
  <section>
    <h1>Categories</h1>
    <p class="text-muted">
      <i class="glyphicon glyphicon-hand-down"></i> Click on category to toggle details.
    </p>
    <template v-for="group in postsGroupedByCategory">
      <div class="category" :id="group.name">
        <a role="button" href="javascript:void(0)" @click="toggleGroup(group)">
          <span>{{group.name}}</span>
          <small class="text-muted">({{group.posts.length}})</small>
        </a>
      </div>
      <collapse v-model="group.show">
        <div class="category-posts">
          <div class="well well-arrow">
            <list-item v-for="post in group.posts" :post="post" :key="post.id"/>
          </div>
        </div>
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

  .category-posts {
    padding: 20px 0 30px;
  }
</style>
