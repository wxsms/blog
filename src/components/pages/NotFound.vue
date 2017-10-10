<template>
  <section>
    <page-header title="404"></page-header>
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <h4>
            <i class="glyphicon glyphicon-exclamation-sign"></i>
            没有找到该页面。
          </h4>
          <br/>
          <p>可能的原因：</p>
          <ul>
            <li>页面不存在，或已被删除；</li>
            <li>网络连接故障。</li>
          </ul>
          <br/>
          <p>尝试搜索？</p>
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
