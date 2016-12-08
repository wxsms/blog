<template>
  <div>
    <div v-show="status===0">
      <p>
        <i class="glyphicon glyphicon-refresh icon-spin"></i>
        <span>{{loadingText || 'Loading...'}}</span>
      </p>
    </div>
    <div v-show="status===-1">
      <p>
        <i class="glyphicon glyphicon-exclamation-sign"></i>
        <span>{{errorText || 'Error. Pls refresh to try again.'}}</span>
      </p>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['status', 'loadingText', 'errorText']
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
