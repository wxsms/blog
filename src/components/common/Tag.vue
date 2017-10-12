<template>
  <router-link :to="'/t/'+tag" class="label-tag">
    <span :class="labelClass">{{tag}}</span>
  </router-link>
</template>

<script>
  import * as tagUtils from './../../util/tagUtils'

  export default {
    props: ['tag'],
    computed: {
      labelClass () {
        return `label label-${tagUtils.getLabelClassByTagName(this.tag)}`
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .label-tag {
    display: inline-block;
    margin: 0 10px 10px 0;
    text-decoration: none !important;

    .label {
      font-weight: normal;
    }
  }
</style>
