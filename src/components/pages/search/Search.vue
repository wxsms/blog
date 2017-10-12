<template>
  <section>
    <page-header title="Search"></page-header>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <search-form></search-form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../../architecture/PageHeader.vue'
  import SearchForm from './../../common/SearchForm.vue'

  export default {
    components: { PageHeader, SearchForm }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
