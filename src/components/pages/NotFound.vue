<template>
  <section>
    <h1>404</h1>
    <h4>
      <i class="glyphicon glyphicon-exclamation-sign"></i>
      <span>Page not found.</span>
    </h4>
    <br/>
    <p>Possible reasons:</p>
    <ul>
      <li>Page deleted or never exist.</li>
      <li>Network connection issue.</li>
    </ul>
    <p>Try search?</p>
    <search-form></search-form>
  </section>
</template>

<script>
  import SearchForm from './../common/SearchForm.vue'

  export default {
    components: {SearchForm}
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
