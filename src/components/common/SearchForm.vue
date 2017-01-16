<template>
  <form class="form-inline" @submit.prevent="doSearch()">
    <div class="form-group">
      <input type="search"
             class="form-control"
             placeholder="SEARCH POSTS..."
             v-model="query"
             required="required"
             minlength="2">
    </div>
  </form>
</template>

<script>
  export default {
    methods: {
      doSearch () {
        this.$router.push(`/q/${this.query}`)
      }
    },
    data () {
      return {
        query: ''
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
