<template>
  <router-link :to="'/t/'+tag" class="label-tag">
    <span :class="'label label-'+getLabelClassByTagName(tag)">{{tag}}</span>
  </router-link>
</template>

<script>
  import {getLabelClassByTagName} from './../../util/tagUtils'

  export default {
    props: ['tag'],
    methods: {
      getLabelClassByTagName
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .label-tag {
    display: inline-block;
    margin: 0 10px 10px 0;
    text-decoration: none !important;
  }
</style>
