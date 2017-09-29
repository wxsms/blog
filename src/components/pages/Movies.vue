<template>
  <section>
    <page-header title="电影"></page-header>
    <div class="container-fluid" ref="container">
      <div class="row">
        <div class="col-xs-12">
          <div class="jumbotron">
            <h2>建设中......</h2>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../architecture/PageHeader.vue'

  export default {
    components: {PageHeader},
    data () {
      return {
        movieList: []
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
