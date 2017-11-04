<template>
  <form :class="classes" @submit.prevent="search">
    <div class="form-group">
      <input type="search"
             class="form-control"
             placeholder="Search..."
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
    data () {
      return {
        query: ''
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
      search () {
        this.$router.push(`/q/${this.query}`)
        this.query = ''
        this.$emit('search')
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import "./../../assets/css/variables";

  .search-form-box {
    .form-group {
      display: block;

      input {
        background: transparent;
        border: none !important;
        box-shadow: none !important;
        box-sizing: border-box;
        color: @gray;
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
