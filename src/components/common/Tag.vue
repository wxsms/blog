<template>
  <router-link :to="'/t#' + tag" class="label-tag">
    <span :class="labelClass">{{tag}}</span>
  </router-link>
</template>

<script>
  import tagUtils from '../../utils/tagUtils'

  export default {
    props: {
      tag: {
        type: String,
        required: true
      },
      muted: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      labelClass () {
        return {
          label: true,
          [`label-${tagUtils.getLabelClassByTagName(this.tag)}`]: this.tag,
          'label-muted': this.muted
        }
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
      transition: background .3s ease-in-out;
    }
  }
</style>
