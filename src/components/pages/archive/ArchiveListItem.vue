<template>
  <div>
    <h5>
      <router-link :to="'/p/' + post.id">{{post.title}}</router-link>
      <small>{{postDate}}</small>
    </h5>
  </div>
</template>

<script>
  import dateUtils from '../../../utils/dateUtils'

  export default {
    props: {
      post: {},
      showYear: {
        type: Boolean,
        'default': false
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
  small {
    margin-left: 10px;
  }
</style>
