<template>
  <section>
    <div class="meta-block">
      <i class="glyphicon glyphicon-calendar"></i>
      <span>{{postDate}}</span>
    </div>
    <div class="meta-block" v-if="post.meta.categories && post.meta.categories.length">
      <i class="glyphicon glyphicon-folder-open"></i>
      <template v-for="(c,index) in postCategories">
        <span v-show="index>0">,&nbsp;</span>
        <router-link :to="'/c/'+c" class="cate-link">{{c}}</router-link>
      </template>
    </div>
    <div class="meta-block">
      <tag v-for="tag in postTags" :tag="tag" :key="tag"></tag>
    </div>
  </section>
</template>

<script>
  import Tag from './../../common/Tag.vue'
  import dateUtils from '../../../utils/dateUtils'

  export default {
    components: {Tag},
    props: ['post'],
    computed: {
      postDate () {
        return dateUtils.getDateStrByPost(this.post)
      },
      postTags () {
        try {
          return this.post.meta.tags
        } catch (e) {
          return []
        }
      },
      postCategories () {
        try {
          return this.post.meta.categories
        } catch (e) {
          return []
        }
      }
    }

  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  section {
    margin: 20px 0;
  }

  .glyphicon {
    margin-right: 5px;
  }

  .meta-block {
    display: inline-block;
    vertical-align: center;
    margin-right: 20px;
  }

  .cate-link {
    color: #666 !important;
    text-decoration: none !important;
  }

  @media print {
    section {
      display: none;
    }
  }
</style>
