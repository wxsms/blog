<template>
  <section>
    <div class="meta-block">
      <i class="glyphicon glyphicon-calendar"></i>
      <span>{{postDate}}</span>
    </div>
    <div class="meta-block" v-if="post.categories && post.categories.length">
      <i class="glyphicon glyphicon-folder-open"></i>
      <template v-for="(c, index) in post.categories">
        <span v-if="index > 0">,&nbsp;</span>
        <router-link :to="'/c/' + c" class="category-link">{{c}}</router-link>
      </template>
    </div>
    <div class="meta-block" v-if="post.tags && post.tags.length">
      <tag v-for="tag in post.tags" :tag="tag" :key="tag"></tag>
    </div>
  </section>
</template>

<script>
  import Tag from './../../common/Tag.vue'
  import dateUtils from '../../../utils/dateUtils'

  export default {
    components: {Tag},
    props: {
      post: {
        type: Object,
        required: true
      }
    },
    computed: {
      postDate () {
        return dateUtils.getDateStrByPost(this.post)
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

  .category-link {
    color: inherit !important;
    text-decoration: none !important;
  }
</style>
