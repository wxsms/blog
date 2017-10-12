<template>
  <div>
    <div v-show="status===0">
      <p>
        <i class="glyphicon glyphicon-refresh icon-spin"></i>
        <span>{{loadingText}}</span>
      </p>
    </div>
    <div v-show="status===-1">
      <p>
        <i class="glyphicon glyphicon-exclamation-sign"></i>
        <span>{{errorText}}</span>
      </p>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      status: {
        type: Number
      },
      loadingText: {
        type: String,
        'default': 'Loading...'
      },
      errorText: {
        type: String,
        'default': 'Load fail. Please refresh to try again.'
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
