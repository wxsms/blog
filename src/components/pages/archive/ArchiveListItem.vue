<template>
  <div>
    <h6>
      <router-link :to="'/p/'+post.meta.id">{{post.meta.title}}</router-link>
      <small>{{postDate}}</small>
    </h6>
  </div>
</template>

<script>
  export default {
    props: ['post'],
    computed: {
      postDate () {
        let date = new Date(this.post.meta.date)
        return date.toISOString().slice(5, 10)
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  small {
    margin-left: 10px;
  }
</style>
