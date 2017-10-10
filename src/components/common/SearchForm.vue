<template>
  <form :class="classes" @submit.prevent="doSearch()">
    <div class="form-group">
      <input type="search"
             class="form-control"
             placeholder="搜索......"
             v-model="query"
             required="required"
             minlength="2">
    </div>
  </form>
</template>

<script>
  export default {
    props: {
      box: {
        type: Boolean,
        'default': false
      }
    },
    computed: {
      classes () {
        return {
          'form-inline': true,
          'search-form-box': this.box
        }
      }
    },
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
  .search-form-box {
    .form-group {
      display: block;

      input {
        background: transparent;
        border: none !important;
        box-shadow: none !important;
        box-sizing: border-box;
        color: #888;
        font-size: 13px;
        height: 26px;
        margin: 0;
        padding: 0;
        width: 100%;
        outline: 0;
      }
    }
  }
</style>
