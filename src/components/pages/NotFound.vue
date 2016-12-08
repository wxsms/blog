<template>
  <section>
    <page-header title="Error"></page-header>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <h5>
            <i class="glyphicon glyphicon-exclamation-sign"></i>
            404 Not Found.
          </h5>
          <br/>
          <search-form></search-form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../architecture/PageHeader.vue'
  import SearchForm from './../common/SearchForm.vue'

  export default {
    components: { PageHeader, SearchForm }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
