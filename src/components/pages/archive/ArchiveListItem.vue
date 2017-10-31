<template>
  <div class="list-item">
    <router-link :to="'/p/' + post.id">{{post.title}}</router-link>
    <small class="text-muted">{{postDate}}</small>
  </div>
</template>

<script>
  import dateUtils from '../../../utils/dateUtils'

  export default {
    props: {
      post: {
        type: Object,
        required: true
      },
      showYear: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      postDate () {
        return dateUtils.getDateStrByPost(this.post, this.showYear)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .list-item {
    margin: 10px 0;

    a {
      color: inherit !important;
      text-decoration: none !important;
    }

    small {
      margin-left: 10px;
    }
  }
</style>
