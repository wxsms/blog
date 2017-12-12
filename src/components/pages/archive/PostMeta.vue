<template>
  <section>
    <div class="meta-block">
      <i class="glyphicon glyphicon-calendar"></i>
      <span>{{postDate}}</span>
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
    margin-right: 20px;
  }
</style>
